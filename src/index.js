import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
//
import Home from './home';
import LoginComp from './login/loginComp';
import ExamComp from './ExamComp';
import ExamAdmin from './admin/ExamAdmin';
import Result from './result/ResultMain';
import HeadAuth from './HeadAuth';
import Error from './error';
//
import Monitor from './admin/monitor';
//
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<LoginComp isHome={true} />} />
        <Route path="/test" element={<ExamComp />} />
        <Route path="/testAdmin" element={<ExamAdmin />} />
        <Route path="/result" element={<Result />} />
        <Route path="/monitor" element={<Monitor />} />
        <Route path="/helloHead" element={<HeadAuth />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
