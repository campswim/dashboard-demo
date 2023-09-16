// @material-ui/icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SmsFailedIcon from '@mui/icons-material/SmsFailed';
import RunningWithErrorsIcon from '@mui/icons-material/RunningWithErrors';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import PeopleIcon from '@mui/icons-material/People';
import LoginIcon from '@mui/icons-material/Login';
// import LogoutIcon from '@mui/icons-material/Logout';
// import DetailsIcon from '@mui/icons-material/Details';
// import LanguageIcon from '@mui/icons-material/Language';

// core components/pages for Admin layout
import Home from './pages/home/home.js';
import FailedOrders from './pages/failed-orders/failed-orders.js';
import FailedProcesses from './pages/failed-processes/failed-processes.js';
// import OrderView from './pages/order-view/order-view.js';
import Settings from './pages/settings/settings.js';
import Users from './pages/users/users.js';
import Login from './pages/login/login.js';

// core components/views for RTL layout
// import RTLPage from 'views/RTLPage/RTLPage.js';

const dashboardRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    rtlName: 'Панель управления',
    icon: DashboardIcon,
    component: Home,
    layout: 'user',
  },
  {
    path: '/failed-orders',
    name: 'Failed Orders',
    rtlName: 'Неуспешные заказы',
    icon: SmsFailedIcon,
    component: FailedOrders,
    layout: 'user',
  },
  {
    path: '/failed-processes',
    name: 'Failed Processes',
    rtlName: 'Неуспешные процессы',
    icon: RunningWithErrorsIcon,
    component: FailedProcesses,
    layout: 'user',
  },
  // {
  //   path: '/order-view',
  //   name: 'Order View',
  //   rtlName: 'Заказ в подробностях',
  //   icon: DetailsIcon,
  //   component: OrderView,
  //   layout: '/admin',
  // },
  {
    path: '/settings',
    name: 'Settings',
    rtlName: 'Таблица',
    icon: SettingsApplicationsIcon,
    component: Settings,
    layout: 'admin',
  },
  {
    path: '/users',
    name: 'Users',
    rtlName: 'Пользователи',
    icon: PeopleIcon,
    component: Users,
    layout: 'admin',
  },
  {
    path: '/login',
    name: 'Sign In',
    rtlName: 'Войти',
    icon: LoginIcon,
    component: Login,
    layout: 'user',
  },
  // {
  //   path: '/rtl-page',
  //   name: 'RTL Support',
  //   rtlName: 'На Русском',
  //   icon: LanguageIcon,
  //   component: RTLPage,
  //   layout: '/rtl',
  // },
];

export default dashboardRoutes;
