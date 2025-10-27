import { lazy } from 'react';

// Lazy load components
const Home = lazy(() => import('../pages/User/Home'));
const LoginComp = lazy(() => import('../login/loginComp'));
const Error = lazy(() => import('../error'));

// Lazy load additional components
const ExamComp = lazy(() => import('../ExamComp'));
const ExamAdmin = lazy(() => import('../admin/ExamAdmin'));
const Result = lazy(() => import('../result/ResultMain'));
const HeadAuth = lazy(() => import('../HeadAuth'));
const Monitor = lazy(() => import('../admin/monitor'));

// Route configuration
export const routes = [
  {
    path: '/',
    element: Home,
    name: 'Home',
  },
  {
    path: '/profile',
    element: LoginComp,
    props: { isHome: true },
    name: 'Profile',
  },
  {
    path: '/test',
    element: ExamComp,
    name: 'Exam',
  },
  {
    path: '/testAdmin',
    element: ExamAdmin,
    name: 'ExamAdmin',
  },
  {
    path: '/result',
    element: Result,
    name: 'Result',
  },
  {
    path: '/monitor',
    element: Monitor,
    name: 'Monitor',
  },
  {
    path: '/helloHead',
    element: HeadAuth,
    name: 'HeadAuth',
  },
  {
    path: '*',
    element: Error,
    name: 'NotFound',
  },
];

export {
  Home,
  LoginComp,
  ExamComp,
  ExamAdmin,
  Result,
  HeadAuth,
  Monitor,
  Error,
};

// import React from 'react';
// import { BrowserRouter, Route, Routes } from 'react-router';

// import Home from './pages/User/Home/index.jsx';

// import LoginComp from './login/loginComp';
// // import ExamComp from './ExamComp';
// // import ExamAdmin from './admin/ExamAdmin';
// // import Result from './result/ResultMain';
// // import HeadAuth from './HeadAuth';
// import Error from './error.jsx';
// // //
// // import Monitor from './admin/monitor';

// function App() {
//   return (
//     <BrowserRouter future={{ v7_startTransition: true }}>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/profile" element={<LoginComp isHome={true} />} />
//         {/*<Route path="/test" element={<ExamComp />} />
//         <Route path="/testAdmin" element={<ExamAdmin />} />
//         <Route path="/result" element={<Result />} />
//         <Route path="/monitor" element={<Monitor />} />
//         <Route path="/helloHead" element={<HeadAuth />} />*/}
//         <Route path="*" element={<Error />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
