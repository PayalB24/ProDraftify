import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './Components/Navbar';
import EmailGenerator from './Pages/EmailGenerator';
import GrammarCheck from './Pages/GrammarCheck';
import './App.css';
import './styles/Navbar.css';
import './styles/Home.css';

function App() {

  return (
    <>
      <div className="blob blob1"></div>
      <div className="blob blob2"></div>


      <Router>
        <Navbar />
        <div className="container">
          <h1 className="heading">Welcome to ProDraftify</h1>
          <h5>Generate Professional Emails with Ease</h5>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/generate" element={<EmailGenerator />} />
            <Route path="/check" element={<GrammarCheck />} />
          </Routes>
        </div>

      </Router>
    </>
  );
}

const Home = () => (
  <div className="card">
    <p className="question">What would you like to do?</p>
    <div className="buttonContainer">
      <Link to="/generate" className="link">
        <button className="button"> Generate Email</button>
      </Link>
      <Link to="/check" className="link">
        <button className="button"> Check Grammar & Format</button>
      </Link>
    </div>
  </div>
);


export default App;
