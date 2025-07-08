const path = require('path');

const createExpoWebpackConfigAsync = require('@expo/webpack-config');

// Enhanced webpack configuration with improved SVG handling
module.exports = async function (env, argv) {
  // Get the default Expo webpack config
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add TypeScript loader configurations with improved handling for interfaces
  config.module.rules.push({
    test: /\.tsx?$/,
    include: [path.resolve(__dirname, '../../shared'), path.resolve(__dirname)],
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['babel-preset-expo', '@babel/preset-typescript'],
      },
    },
  });

  // Add SVG loader with fallback options for improved error handling
  const svgRule = {
    test: /\.svg$/,
    oneOf: [
      // React component usage: <MySvgComponent width={50} height={50} />
      {
        resourceQuery: /react/, // For ?react suffix
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              throwIfNamespace: false, // Don't throw on namespace tags
              svgoConfig: {
                plugins: [
                  {
                    name: 'preset-default',
                    params: {
                      overrides: {
                        // Don't remove viewBox as it's needed for responsive SVGs
                        removeViewBox: false,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      // Standard asset loading with fallback for problematic SVGs
      {
        use: [
          {
            loader: 'svg-url-loader',
            options: {
              limit: 10000, // 10KB - smaller files will be inlined as data URL
              name: 'assets/[name].[hash:8].[ext]',
              fallback: 'file-loader', // Use file-loader as fallback for larger files
              iesafe: true, // Make SVG URLs safe for IE
            },
          },
          {
            // Apply SVG optimizer with safer settings
            loader: 'svgo-loader',
            options: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      // Don't remove viewBox and keep IDs
                      removeViewBox: false,
                      // Disable problematic plugins that might cause rendering issues
                      convertShapeToPath: false,
                      mergePaths: false,
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    ],
  };

  // Find the existing rules
  const fileLoaderRule = config.module.rules.find(
    (rule) => rule.oneOf && Array.isArray(rule.oneOf)
  );

  // Add a rule to handle SVG files differently
  if (fileLoaderRule && fileLoaderRule.oneOf) {
    // Add SVG rule before any other rules that might handle SVG
    fileLoaderRule.oneOf.unshift(svgRule);
  }

  // Add a custom resolver to help with SVG imports
  config.resolve = config.resolve || {};
  config.resolve.alias = {
    ...config.resolve.alias,
    '@assets': path.resolve(__dirname, 'assets'),
    'react-native-svg': 'react-native-svg-web',
    'history-time-shared': path.resolve(__dirname, '../../shared/src'),
    react: path.resolve(__dirname, 'node_modules/react'),
    'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
  };

  // Add fallback options for better error handling
  config.resolve.fallback = {
    ...config.resolve.fallback,
    'react-native-svg': require.resolve('react-native-svg-web'),
  };

  // Add error handling plugin for better debugging
  if (env.mode === 'development') {
    config.plugins.push({
      apply: (compiler) => {
        // Log errors related to SVG files
        compiler.hooks.done.tap('SVGErrorLogger', (stats) => {
          if (stats.hasErrors()) {
            const svgErrors = stats.compilation.errors.filter(
              (error) =>
                error.module && error.module.resource && error.module.resource.endsWith('.svg')
            );

            if (svgErrors.length > 0) {
              console.warn('⚠️ SVG compilation issues detected:');
              svgErrors.forEach((error) => {
                console.warn(`SVG Error in ${path.relative(process.cwd(), error.module.resource)}`);
                console.warn(error.message);
              });
            }
          }
        });
      },
    });
  }

  return config;
};
