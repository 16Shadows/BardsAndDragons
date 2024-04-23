import React from 'react';
import AuthProvider from 'react-auth-kit'
import RoutesComponent from './Routes';
import createStore from 'react-auth-kit/createStore';

const store = createStore({
    authName: '_auth',
    authType: 'localstorage'
});

function App() {
    return (
        <AuthProvider store={store}>
            <RoutesComponent/>
        </AuthProvider>
    );
}

export default App;