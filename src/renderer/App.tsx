import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';
import Login from './pages/Login';
import Auth from './components/Auth';
import Launcher from './pages/Launcher';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route element={<Auth />}>
                    <Route path='/' element={<Launcher />} />
                </Route>
            </Routes>
        </Router>
    );
}