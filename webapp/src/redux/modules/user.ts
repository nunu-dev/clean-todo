import { API_SERVER } from 'react-native-dotenv';

import { ActionType } from '../../model/Common';
import UserState from '../../model/User';
import { SecureStore } from 'expo';

// action

const SAVE_TOKEN = 'SAVE_TOKEN';

// action creater

const saveToken = (token: string) => {
  return {
    type: SAVE_TOKEN,
    token
  };
};

// api action

const usernameLogin = (username: string, password: string) => {
  return (dispatch: any) => {
    fetch(API_SERVER + '/users/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: username,
        password
      })
    })
      .then(response => response.json())
      .then(json => {
        if (json.token) {
          dispatch(saveToken(json.token));
        }
      })
      .catch(err => console.log(err));
  };
};

const createAccount = (username, password, passwordValid) => {
  return async dispatch => {
    fetch(API_SERVER + '/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: username,
        password,
        passwordValid
      })
    })
      .then(response => response.json())
      .then(json => console.log(json)) // TODO: 배포시 삭제
      .catch(err => console.log(err));
  };
};

function setLoginStatus() {
  return async (dispatch, getState) => {
    const token = await SecureStore.getItemAsync('token');
    dispatch(saveToken(token));
  };
}

const initialState = {
  isLoggedIn: undefined,
  token: undefined
};

// reducer
const reducer = (state = initialState, action: ActionType) => {
  switch (action.type) {
    case SAVE_TOKEN:
      return applySetToken(state, action);
    default:
      return state;
  }
};

// reducer function
const applySetToken = (state: UserState, action: ActionType) => {
  const { token } = action;
  if (typeof token === 'string') SecureStore.setItemAsync('token', token);
  return {
    isLoggedIn: token !== undefined && token !== null,
    token
  };
};

// export

export const actionCreators = {
  createAccount,
  usernameLogin,
  setLoginStatus
};

export default reducer;
