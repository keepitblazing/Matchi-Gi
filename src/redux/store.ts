import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session';
import userSlice from './features/userSlice';
import addressSlice from './features/addressSlice';
import commonSlice from './features/commonSlice';
import keywordSlice from './features/keywordSlice';
import sortSlice from './features/sortSlice';
import searchSlice from './features/searchSlice';
import overlaySlice from './features/overlaySlice';
import positionSlice from './features/postionSlice';

const persistConfig = {
  key: 'root',
  storage,
  whiteList: ['postion'],
};

const reducers = combineReducers({
  position: positionSlice.reducer,
});

const persistReducered = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    address: addressSlice.reducer,
    common: commonSlice.reducer,
    keyword: keywordSlice.reducer,
    sort: sortSlice.reducer,
    search: searchSlice.reducer,
    overlay: overlaySlice.reducer,
    persistReducered,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
