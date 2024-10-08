import Footer from "./components/Front/Footer";
import AuthPage from "./components/Auth/AuthPage";
import {
  BrowserRouter as Router,
  Route,
  Routes,
} from "react-router-dom";
import BlogList from "./components/Blogs/BlogList";
import ProfilePage from "./components/Profile/ProfilePage";
import BlogUpload from "./components/Blogs/BlogUpload";

function App() {
  return (
    <>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/auth-page" element={<AuthPage />} />
            <Route path="/blog-page" element={<BlogList />} />
            <Route path="/blog-upload" element={<BlogUpload />} />
            <Route path="/" element={<AuthPage/>} />
            <Route path="/myprofile" element={<ProfilePage/>} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </>
  );
}

export default App;
