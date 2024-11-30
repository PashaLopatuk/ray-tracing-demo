import { PropsWithChildren, useRef, useState } from 'react';
import { Provider } from 'react-redux';
import { createStore } from '../lib/redux/store';

interface StoreProviderProps extends PropsWithChildren<{}> {

}

export default function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(createStore)

  return <Provider store={store}>{children}</Provider>;
}
