import React from "react";
import { FaBolt, FaBookOpen, FaUsers } from "react-icons/fa";
import Footer from "../components/Footer";

const About = () => {
  return (
     <>
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col items-center justify-center px-4 py-12 space-y-12">
      
      {/* Title */}
      <h1 className="text-5xl font-extrabold text-center">
        About DevArena Premium
      </h1>
      <p className="text-lg text-gray-300 text-center max-w-3xl">
        Level up your coding skills with exclusive challenges, tutorials, analytics, and community mentorship. 
        DevArena Premium is designed to give you the competitive edge you need to succeed.
      </p>

      {/* Card 1 - Why Premium */}
      <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl hover:scale-105 hover:shadow-green-500/50 transition-transform duration-300 w-full max-w-4xl h-72 flex items-start space-x-6">
        <FaBolt className="text-green-400 text-5xl mt-2" />
        <div>
          <h2 className="text-3xl font-bold mb-3 text-green-400">Why Premium?</h2>
          <p className="text-white text-lg">
            Free resources can take you only so far. Premium gives you advanced challenges, structured tutorials, 
            and tools to prepare for interviews or real-world projects.  
            Everything is designed to make you a confident developer faster.
          </p>
        </div>
      </div>

      {/* Card 2 - What You Get */}
      <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl hover:scale-105 hover:shadow-green-500/50 transition-transform duration-300 w-full max-w-4xl h-72 flex items-start space-x-6">
        <FaBookOpen className="text-green-400 text-5xl mt-2" />
        <div>
          <h2 className="text-3xl font-bold mb-3 text-green-400">What You Get</h2>
          <p className="text-white text-lg">
            Exclusive coding challenges, detailed step-by-step tutorials, progress tracking, and advanced analytics.  
            Every feature is designed to help you improve steadily and track your growth as a coder.
          </p>
        </div>
      </div>

      {/* Card 3 - Extra Benefits */}
      <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl hover:scale-105 hover:shadow-green-500/50 transition-transform duration-300 w-full max-w-4xl h-72 flex items-start space-x-6">
        <FaUsers className="text-green-400 text-5xl mt-2" />
        <div>
          <h2 className="text-3xl font-bold mb-3 text-green-400">Extra Benefits</h2>
          <p className="text-white text-lg">
            Get early access to new challenges, downloadable code snippets, priority support, and access to an exclusive developer community.  
            Everything is designed to give you the edge over other coders.
          </p>
        </div>
      </div>
    </div>
      <Footer/>
     </>
  );
};

export default About;
