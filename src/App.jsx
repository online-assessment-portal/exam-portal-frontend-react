import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Home from './pages/User/Home/index.jsx';

import LoginComp from './login/loginComp';
// import ExamComp from './ExamComp';
// import ExamAdmin from './admin/ExamAdmin';
// import Result from './result/ResultMain';
// import HeadAuth from './HeadAuth';
import Error from './error.jsx';
// //
// import Monitor from './admin/monitor';
//
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<LoginComp isHome={true} />} />
        {/*<Route path="/test" element={<ExamComp />} />
        <Route path="/testAdmin" element={<ExamAdmin />} />
        <Route path="/result" element={<Result />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/helloHead" element={<HeadAuth />} />*/}
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
