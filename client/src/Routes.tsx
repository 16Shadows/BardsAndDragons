import React from 'react'
import {BrowserRouter, Route, Routes} from 'react-router-dom'

import RequireAuth from '@auth-kit/react-router/RequireAuth'

import Home from './pages/Home'
import Login from './pages/Login'
import SecureComponent from './pages/SecureComponent'
import Registration from './pages/Registration'

const RoutesComponent = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={'/'} element={<Home/>}/>
                <Route path={'/login'} element={<Login/>}/>
                <Route path={'/register'} element={<Registration/>}/>
                <Route path={'/secure'} element={
                    <RequireAuth fallbackPath={'/login'}>
                        <SecureComponent/>
                    </RequireAuth>
                }/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesComponent