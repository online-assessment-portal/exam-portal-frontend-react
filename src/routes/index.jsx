import { lazy } from 'react';

// Lazy load components
const Home = lazy(() => import('../pages/User/Home'));
const Profile = lazy(() => import('../pages/User/Profile'));
const AuthPage = lazy(() => import('../pages/User/Auth/index'));
const Error = lazy(() => import('../error'));

// Lazy load additional components
const ExamComp = lazy(() => import('../ExamComp.jsx'));
// const ExamAdmin = lazy(() => import('../admin/ExamAdmin'));
// const Result = lazy(() => import('../result/ResultMain'));
// const HeadAuth = lazy(() => import('../HeadAuth'));
// const Monitor = lazy(() => import('../admin/monitor'));

// Lazy load legal components
const TermsOfService = lazy(() => import('../components/legal/TermsOfService'));
const PrivacyPolicy = lazy(() => import('../components/legal/PrivacyPolicy'));

// Route configuration
export const routes = [
  {
    path: '/',
    element: Home,
    name: 'Home',
  },
  {
    path: '/auth',
    element: AuthPage,
    props: { isHome: true }, // TODO: To be verified
    name: 'Authentication',
  },
  {
    path: '/profile',
    element: Profile,
    name: 'Authentication',
    isProtected: true,
  },
  {
    path: '/assessment',
    element: ExamComp,
    name: 'Exam',
    isProtected: true,
    requireProfile: true,
  },
  // {
  //   path: '/testAdmin',
  //   element: ExamAdmin,
  //   name: 'ExamAdmin',
  //   isProtected: true,
  // },
  // {
  //   path: '/result',
  //   element: Result,
  //   name: 'Result',
  //   isProtected: true,
  // },
  // {
  //   path: '/monitor',
  //   element: Monitor,
  //   name: 'Monitor',
  //   isProtected: true,
  // },
  // {
  //   path: '/helloHead',
  //   element: HeadAuth,
  //   name: 'HeadAuth',
  //   isProtected: true,
  // },
  {
    path: '/terms',
    element: TermsOfService,
    name: 'TermsOfService',
  },
  {
    path: '/privacy',
    element: PrivacyPolicy,
    name: 'PrivacyPolicy',
  },
  {
    path: '*',
    element: Error,
    name: 'NotFound',
  },
];

// export {
//   AuthPage,
//   Error,
//   // ExamAdmin,
//   ExamComp,
//   // HeadAuth,
//   Home,
//   // Monitor,
//   Profile,
//   // Result,
//   TermsOfService,
//   PrivacyPolicy,
// };

// import React from 'react';
// import { BrowserRouter, Route, Routes } from 'react-router';

// import Home from './pages/User/Home/index.jsx';

// import AuthPage from './login/AuthPage';
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
//         <Route path="/profile" element={<AuthPage isHome={true} />} />
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
