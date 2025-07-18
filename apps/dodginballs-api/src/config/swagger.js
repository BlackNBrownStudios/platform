const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const packageJson = require('../../package.json');
const config = require('./config');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'DodginBalls API Documentation',
    version: packageJson.version,
    description: 'API documentation for the DodginBalls backend',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'DodginBalls Team',
      url: 'https://github.com/yourusername/dodginballs',
    },
  },
  servers: [
    {
      url: 'http://dodginballs-dev-alb-1428507927.us-west-2.elb.amazonaws.com/api/v1',
      description: 'Development ALB endpoint',
    },
    {
      url: `http://localhost:3006/api/v1`,
      description: 'Development server',
    },
    {
      url: '/api/v1',
      description: 'Relative path',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          name: {
            type: 'string',
            description: 'User name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'gamemaster'],
            description: 'User role',
          },
          isEmailVerified: {
            type: 'boolean',
            description: 'Whether the email is verified',
          },
          statistics: {
            type: 'object',
            properties: {
              gamesPlayed: {
                type: 'integer',
                description: 'Number of games played',
              },
              gamesWon: {
                type: 'integer',
                description: 'Number of games won',
              },
              totalScore: {
                type: 'integer',
                description: 'Total score accumulated',
              },
              highScore: {
                type: 'integer',
                description: 'Highest score achieved',
              },
              throws: {
                type: 'integer',
                description: 'Total throws made',
              },
              catches: {
                type: 'integer',
                description: 'Total catches made',
              },
              hits: {
                type: 'integer',
                description: 'Total hits made',
              },
              dodges: {
                type: 'integer',
                description: 'Total dodges made',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Team: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Team ID',
          },
          name: {
            type: 'string',
            description: 'Team name',
          },
          color: {
            type: 'string',
            description: 'Team color in hex format',
          },
          logo: {
            type: 'string',
            description: 'Team logo URL',
          },
          captain: {
            type: 'string',
            description: 'Team captain user ID',
          },
          members: {
            type: 'array',
            items: {
              type: 'string',
              description: 'User ID of team member',
            },
            description: 'Array of team member user IDs',
          },
          statistics: {
            type: 'object',
            properties: {
              wins: {
                type: 'integer',
                description: 'Number of matches won',
              },
              losses: {
                type: 'integer',
                description: 'Number of matches lost',
              },
              totalMatches: {
                type: 'integer',
                description: 'Total number of matches played',
              },
              totalScore: {
                type: 'integer',
                description: 'Total score accumulated',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Match: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Match ID',
          },
          court: {
            type: 'string',
            description: 'Court/location for the match',
          },
          matchState: {
            type: 'integer',
            enum: [0, 1, 2, 3],
            description: 'Match state (0=pending, 1=in progress, 2=completed, 3=cancelled)',
          },
          winningTeamId: {
            type: 'string',
            description: 'ID of the winning team',
          },
          losingTeamId: {
            type: 'string',
            description: 'ID of the losing team',
          },
          teams: {
            type: 'array',
            items: {
              type: 'string',
              description: 'Team ID',
            },
            description: 'Array of team IDs participating in the match',
          },
          startedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the match started',
          },
          endedAt: {
            type: 'string',
            format: 'date-time',
            description: 'When the match ended',
          },
          gameMode: {
            type: 'string',
            enum: ['standard', 'tournament', 'practice', 'custom'],
            description: 'Game mode for the match',
          },
          scoreData: {
            type: 'object',
            description: 'Custom score data for the match',
          },
          matchStatistics: {
            type: 'object',
            properties: {
              totalThrows: {
                type: 'integer',
                description: 'Total throws in the match',
              },
              totalCatches: {
                type: 'integer',
                description: 'Total catches in the match',
              },
              totalHits: {
                type: 'integer',
                description: 'Total hits in the match',
              },
              totalDodges: {
                type: 'integer',
                description: 'Total dodges in the match',
              },
              matchDuration: {
                type: 'integer',
                description: 'Match duration in seconds',
              },
              mvpPlayerId: {
                type: 'string',
                description: 'ID of the MVP player',
              },
            },
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          code: {
            type: 'integer',
            description: 'HTTP status code',
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
      // Leaderboard Schemas
      UserLeaderboard: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          statistics: {
            type: 'object',
            properties: {
              gamesPlayed: {
                type: 'number',
              },
              gamesWon: {
                type: 'number',
              },
              totalScore: {
                type: 'number',
              },
              highScore: {
                type: 'number',
              },
              throws: {
                type: 'number',
              },
              catches: {
                type: 'number',
              },
              hits: {
                type: 'number',
              },
              dodges: {
                type: 'number',
              },
            },
          },
        },
      },
      TeamLeaderboard: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          name: {
            type: 'string',
          },
          color: {
            type: 'string',
          },
          captain: {
            type: 'string',
          },
          memberCount: {
            type: 'number',
          },
          statistics: {
            type: 'object',
            properties: {
              wins: {
                type: 'number',
              },
              losses: {
                type: 'number',
              },
              totalMatches: {
                type: 'number',
              },
              totalScore: {
                type: 'number',
              },
            },
          },
        },
      },
      MatchStatistics: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          court: {
            type: 'string',
          },
          startedAt: {
            type: 'string',
            format: 'date-time',
          },
          endedAt: {
            type: 'string',
            format: 'date-time',
          },
          gameMode: {
            type: 'string',
          },
          winningTeamId: {
            type: 'string',
          },
          losingTeamId: {
            type: 'string',
          },
          teams: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
          statistics: {
            type: 'object',
            properties: {
              totalThrows: {
                type: 'number',
              },
              totalCatches: {
                type: 'number',
              },
              totalHits: {
                type: 'number',
              },
              totalDodges: {
                type: 'number',
              },
              matchDuration: {
                type: 'number',
              },
            },
          },
        },
      },
      GlobalStatistics: {
        type: 'object',
        properties: {
          totalUsers: {
            type: 'number',
          },
          totalTeams: {
            type: 'number',
          },
          totalMatches: {
            type: 'number',
          },
          statistics: {
            type: 'object',
            properties: {
              totalThrows: {
                type: 'number',
              },
              totalCatches: {
                type: 'number',
              },
              totalHits: {
                type: 'number',
              },
              totalDodges: {
                type: 'number',
              },
              totalMatchDuration: {
                type: 'number',
              },
              averageMatchDuration: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/v1/*.js', './src/models/*.js', './src/docs/*.yaml'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerSpec,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
};
