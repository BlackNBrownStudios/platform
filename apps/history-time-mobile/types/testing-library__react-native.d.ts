/**
 * Type definitions for @testing-library/react-native
 */
declare module '@testing-library/react-native' {
  import { ReactElement } from 'react';
  import { ReactTestInstance } from 'react-test-renderer';

  export interface RenderOptions {
    wrapper?: React.ComponentType<any>;
    createNodeMock?: (element: React.ReactElement) => any;
    [key: string]: any;
  }

  export interface RenderResult {
    container: ReactTestInstance;
    baseElement: ReactTestInstance;
    debug: (element?: ReactTestInstance | null) => void;
    unmount: () => void;
    rerender: (ui: ReactElement) => void;
    asJSON: () => ReactTestInstance | null;
    toJSON: () => ReactTestInstance | null;
    queryByTestId: (id: string) => ReactTestInstance | null;
    getByTestId: (id: string) => ReactTestInstance;
    queryByText: (text: string | RegExp) => ReactTestInstance | null;
    getByText: (text: string | RegExp) => ReactTestInstance;
    queryByPlaceholderText: (text: string | RegExp) => ReactTestInstance | null;
    getByPlaceholderText: (text: string | RegExp) => ReactTestInstance;
    queryByDisplayValue: (value: string | RegExp) => ReactTestInstance | null;
    getByDisplayValue: (value: string | RegExp) => ReactTestInstance;
    queryByRole: (role: string) => ReactTestInstance | null;
    getByRole: (role: string) => ReactTestInstance;
    queryByHintText: (text: string | RegExp) => ReactTestInstance | null;
    getByHintText: (text: string | RegExp) => ReactTestInstance;
    queryAllByTestId: (id: string) => ReactTestInstance[];
    getAllByTestId: (id: string) => ReactTestInstance[];
    queryAllByText: (text: string | RegExp) => ReactTestInstance[];
    getAllByText: (text: string | RegExp) => ReactTestInstance[];
    queryAllByPlaceholderText: (text: string | RegExp) => ReactTestInstance[];
    getAllByPlaceholderText: (text: string | RegExp) => ReactTestInstance[];
    queryAllByDisplayValue: (value: string | RegExp) => ReactTestInstance[];
    getAllByDisplayValue: (value: string | RegExp) => ReactTestInstance[];
    queryAllByRole: (role: string) => ReactTestInstance[];
    getAllByRole: (role: string) => ReactTestInstance[];
    queryAllByHintText: (text: string | RegExp) => ReactTestInstance[];
    getAllByHintText: (text: string | RegExp) => ReactTestInstance[];
    [key: string]: any;
  }

  export const render: (ui: ReactElement, options?: RenderOptions) => RenderResult;
  export const cleanup: () => void;
  export const fireEvent: {
    press: (element: ReactTestInstance) => void;
    changeText: (element: ReactTestInstance, text: string) => void;
    scroll: (element: ReactTestInstance, eventData: any) => void;
    [key: string]: any;
  };
  export const waitFor: <T>(
    callback: () => T,
    options?: { timeout?: number; interval?: number }
  ) => Promise<T>;
  export const act: (callback: () => void | Promise<void>) => Promise<undefined>;
  export const within: (element: ReactTestInstance) => RenderResult;
}
