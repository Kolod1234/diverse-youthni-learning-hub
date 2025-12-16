import Home from './pages/Home';
import Explore from './pages/Explore';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import LessonPlayer from './pages/LessonPlayer';
import Quiz from './pages/Quiz';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Explore": Explore,
    "Dashboard": Dashboard,
    "CourseDetails": CourseDetails,
    "LessonPlayer": LessonPlayer,
    "Quiz": Quiz,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};