import React, { useEffect, useState } from 'react';
import ProfessionalNavbar from '../../components/Navbar/ProfessionalNavbar';
import { UserAuth } from '../../context/AuthContext';
import './Evaluation.css';
import axios from 'axios';
import Footer from '../../components/Footer/Footer';
import UserIterview from '../../components/UserInterview/UserInterview';
import LoadingComponent from '../../components/LoadingComponent/LoadingComponent';

const Evaluation = () => {
  const { user } = UserAuth();
  const [interviews, setInterviews] = useState(null);
  useEffect(() => {
    document.title = 'Evaluation';
  }, []);

  useEffect(() => {
    const fetchUserInterviews = async () => {
      try {
        const response = await axios.get(`/userInterview/${user.uid}`);
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching user interviews:', error);
      }
    };

    if (user) {
      fetchUserInterviews();
    }
  }, [user]);

  return (
    <>
      <ProfessionalNavbar />
      <div className="evaluation-container">
        {interviews === null ? (
          <h2>No History of Previous Interviews</h2>
        ) : (
          interviews.map((interview, index) => (
            <UserIterview key={index} interview={interview}/>
          ))
        )}
      </div>
      <Footer />
    </>
  );
};

export default Evaluation;
