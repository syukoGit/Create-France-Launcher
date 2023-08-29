import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.scss';
import Login from './pages/Login';
import Auth from './components/Auth';
import Launcher from './pages/Launcher';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    console.log('App');

    return (
        <div className='app'>
            <Router>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route element={<Auth />}>
                        <Route path='/*' element={<Launcher />} />
                    </Route>
                </Routes>
            </Router>
            <ToastContainer
                position='top-right'
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='colored'
            />
        </div>
    );
}
