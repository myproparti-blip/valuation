import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  message: '',
};

const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    showLoader: (state, action) => {
      state.isLoading = true;
      state.message = action.payload || 'Loading...';
    },
    hideLoader: (state) => {
      state.isLoading = false;
      state.message = '';
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;
