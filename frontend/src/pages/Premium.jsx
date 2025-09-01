import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import * as API from "../api/adminApi";
import PremiumCard from "../components/PremiumCard";
import { motion } from "framer-motion";
import { FiAward, FiLock, FiStar, FiZap, FiTrendingUp, FiCreditCard, FiCheckCircle, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";

const PremiumPage = () => {
  const [premiumFiles, setPremiumFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { user, userProfile } = useAuth();

  const fetchPremium = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING PREMIUM CONTENT ===');
      const res = await API.getPremium();
      console.log('Premium API response:', res.data);
      console.log('Premium files count:', res.data.length);
      
      // Log each item for debugging
      res.data.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          id: item._id,
          name: item.name || item.title,
          fileUrl: item.fileUrl,
          fileName: item.fileName,
          fileType: item.fileType,
          category: item.category,
          difficulty: item.difficulty,
          isPremiumContent: item.isPremiumContent
        });
      });
      
      setPremiumFiles(res.data);
      setError("");
    } catch (err) {
      console.error('Error fetching premium content:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        if (err.response.status === 401) setError("Unauthorized! Login required.");
        else if (err.response.status === 403) setError("Access denied! Admin only.");
        else setError("Failed to fetch premium content.");
      } else setError("Network error. Check your server or internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.deletePremium(id);
      setPremiumFiles((prev) => prev.filter((item) => item._id !== id));
      toast.success("Premium content deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete premium content.");
    }
  };

  const handleCardClick = (item) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (!userProfile?.isPremium) {
      toast.error("Premium membership required to access this content!");
      return;
    }
    
    // The file opening is now handled directly in PremiumCard component
    // This function is kept for backward compatibility but not used for file opening
    console.log('Card clicked:', item);
    
    // Check if the URL is valid (not localhost)
    if (item.fileUrl && (item.fileUrl.includes('localhost') || item.fileUrl.startsWith('/uploads/'))) {
      toast.error("File URL is invalid. Please contact admin to fix this.");
      return;
    }
  };

  useEffect(() => {
    fetchPremium();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    // Check if script is already loaded
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    
    // Try multiple CDN sources
    const cdnSources = [
      'https://checkout.razorpay.com/v1/checkout.js',
      'https://cdn.razorpay.com/checkout.js',
      'https://js.razorpay.com/v1/checkout.js'
    ];
    
    let currentIndex = 0;
    
    const tryLoadScript = () => {
      if (currentIndex >= cdnSources.length) {
        console.error('All Razorpay CDN sources failed');
        setRazorpayLoaded(false);
        toast.error("Payment system failed to load. Please refresh the page.");
        return;
      }
      
      const script = document.createElement('script');
      script.src = cdnSources[currentIndex];
      script.async = true;
      script.onload = () => {
        console.log(`Razorpay script loaded successfully from: ${cdnSources[currentIndex]}`);
        setRazorpayLoaded(true);
        toast.success("Payment system ready!");
      };
      script.onerror = () => {
        console.error(`Failed to load Razorpay script from: ${cdnSources[currentIndex]}`);
        currentIndex++;
        tryLoadScript();
      };
      
      // Set timeout to prevent hanging
      setTimeout(() => {
        if (!window.Razorpay) {
          console.error(`Script load timeout for: ${cdnSources[currentIndex]}`);
          currentIndex++;
          tryLoadScript();
        }
      }, 5000);
      
      document.body.appendChild(script);
    };
    
    tryLoadScript();
  };

  const handlePremiumUpgrade = (plan) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (userProfile?.isPremium) {
      toast.success("You are already a premium member!");
      return;
    }
    
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    
    setPaymentLoading(true);
    try {
      console.log('Starting payment process...');
      console.log('Razorpay available:', !!window.Razorpay);
      console.log('Selected plan:', selectedPlan);
      
      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        console.log('Razorpay not loaded, attempting to reload...');
        loadRazorpayScript();
        // Wait a bit for script to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!window.Razorpay) {
          throw new Error('Razorpay failed to load. Please refresh the page and try again.');
        }
      }

      // Let Razorpay handle order ID generation
      console.log('Using Razorpay auto-generated order ID');
      
      const options = {
        key: 'rzp_test_R65rS3t4vqO7i1',
        amount: selectedPlan.price * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'DevArena Premium',
        description: `${selectedPlan.name} - Premium Access`,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Default icon
        // Remove order_id - let Razorpay generate it automatically
        handler: async function (response) {
          console.log('Payment successful:', response);
          
          try {
            // Update user's premium status in backend
            const updateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/upgrade-to-premium`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                plan: selectedPlan.name,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                amount: selectedPlan.price
              })
            });
            
            if (updateResponse.ok) {
              toast.success('Payment successful! Welcome to Premium! 🎉');
              // Refresh user profile to get updated premium status
              window.location.reload(); // Simple solution - reload page
            } else {
              toast.error('Payment successful but premium activation failed. Please contact support.');
            }
          } catch (error) {
            console.error('Error updating premium status:', error);
            toast.error('Payment successful but premium activation failed. Please contact support.');
          }
          
          setShowPaymentModal(false);
          setSelectedPlan(null);
        },
        prefill: {
          name: user || 'User',
          email: userProfile?.email || 'user@example.com',
          contact: '9999999999' // Add a default contact number
        },
        notes: {
          plan: selectedPlan.name,
          user: user || 'Anonymous'
        },
        theme: {
          color: '#10B981', // Green color matching your theme
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed');
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }
        },
        // Add error handling
        onError: function (error) {
          console.error('Payment error:', error);
          toast.error(`Payment failed: ${error.description || 'Something went wrong'}`);
        },
        // Simplified configuration
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      };

      console.log('Payment options:', options);
      console.log('Creating Razorpay instance...');
      
      const rzp = new window.Razorpay(options);
      console.log('Razorpay instance created, opening payment...');
      rzp.open();
      
    } catch (error) {
      console.error('Payment setup error:', error);
      toast.error(`Payment setup failed: ${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400 text-lg">Loading Premium Content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiLock className="text-red-500 text-2xl" />
          </div>
          <p className="text-red-400 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <FiAward className="text-white text-3xl" />
              </div>
            </div>
                         <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
               Premium Content
             </h1>
             
             {/* Premium Status Indicator */}
             {user && (
               <div className="mb-6">
                 {userProfile?.isPremium ? (
                   <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-black px-4 py-2 rounded-full font-semibold">
                     <FiCheckCircle className="text-lg" />
                     Premium Member - Full Access
                   </div>
                 ) : (
                   <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-full font-semibold">
                     <FiLock className="text-lg" />
                     Free Member - Upgrade for Access
                   </div>
                 )}
               </div>
             )}
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Unlock exclusive resources, advanced tutorials, and premium materials to accelerate your coding journey
            </p>
            
                         {/* Premium Plans */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-green-500/50 transition-all duration-300"
               >
                 <div className="text-center">
                   <FiStar className="text-yellow-400 text-3xl mx-auto mb-3" />
                   <h3 className="text-xl font-bold text-white mb-2">Basic Plan</h3>
                   <div className="text-3xl font-bold text-green-400 mb-4">₹99<span className="text-lg text-gray-400">/month</span></div>
                   <ul className="text-gray-300 text-sm mb-6 space-y-2">
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Access to 50+ Premium Problems
                     </li>
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Detailed Solutions
                     </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      Priority Support
                    </li>
                   </ul>
                   <button
                     onClick={() => handlePremiumUpgrade({ name: 'Basic Plan', price: 99 })}
                     className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                   >
                     <FiCreditCard className="inline mr-2" />
                     Upgrade Now
                   </button>
                 </div>
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.4 }}
                 className="bg-gradient-to-br from-green-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50 relative"
               >
                 <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                   <div className="bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                     MOST POPULAR
                   </div>
                 </div>
                 <div className="text-center">
                   <FiZap className="text-green-400 text-3xl mx-auto mb-3" />
                   <h3 className="text-xl font-bold text-white mb-2">Pro Plan</h3>
                   <div className="text-3xl font-bold text-green-400 mb-4">₹199<span className="text-lg text-gray-400">/month</span></div>
                   <ul className="text-gray-300 text-sm mb-6 space-y-2">
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Everything in Basic
                     </li>
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Access to 200+ Premium Problems
                     </li>
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Video Tutorials
                     </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      Advanced Analytics
                    </li>
                   </ul>
                   <button
                     onClick={() => handlePremiumUpgrade({ name: 'Pro Plan', price: 199 })}
                     className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                   >
                     <FiCreditCard className="inline mr-2" />
                     Upgrade Now
                   </button>
                 </div>
               </motion.div>
               
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.6 }}
                 className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all duration-300"
               >
                 <div className="text-center">
                   <FiTrendingUp className="text-blue-400 text-3xl mx-auto mb-3" />
                   <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                   <div className="text-3xl font-bold text-blue-400 mb-4">₹499<span className="text-lg text-gray-400">/month</span></div>
                   <ul className="text-gray-300 text-sm mb-6 space-y-2">
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Everything in Pro
                     </li>
                     <li className="flex items-center gap-2">
                       <FiCheckCircle className="text-green-400" />
                       Unlimited Access
                     </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      Custom Challenges
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheckCircle className="text-green-400" />
                      Dedicated Support
                    </li>
                   </ul>
                   <button
                     onClick={() => handlePremiumUpgrade({ name: 'Enterprise Plan', price: 499 })}
                     className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300"
                   >
                     <FiCreditCard className="inline mr-2" />
                     Upgrade Now
                   </button>
                 </div>
               </motion.div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* Premium Content Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
      {premiumFiles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAward className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No Premium Content Yet</h3>
            <p className="text-gray-500">Check back soon for exclusive resources!</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {premiumFiles.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                                 <PremiumCard 
                   item={item} 
                   onDelete={handleDelete}
                  onCardClick={handleCardClick}
                   isLoggedIn={!!user}
                   isPremium={userProfile?.isPremium || false}
                 />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-green-500 rounded-2xl p-8 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="text-xl" />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiLock className="text-red-400 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Login Required</h3>
              <p className="text-gray-400 mb-6">
                You need to be logged in to access premium content.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    // Redirect to login or trigger login modal
                    window.location.href = '/';
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </motion.div>
                 </div>
       )}

       {/* Payment Modal */}
       {showPaymentModal && selectedPlan && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-green-500 rounded-2xl p-8 max-w-md w-full mx-4 relative"
          >
            <button
              onClick={() => {
                setShowPaymentModal(false);
                setSelectedPlan(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="text-xl" />
            </button>
             <div className="text-center">
               <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                 <FiCreditCard className="text-green-400 text-2xl" />
               </div>
               <h3 className="text-2xl font-bold text-white mb-2">Upgrade to Premium</h3>
               <div className="bg-gray-800 rounded-xl p-4 mb-6">
                 <h4 className="text-lg font-semibold text-green-400 mb-2">{selectedPlan.name}</h4>
                 <div className="text-3xl font-bold text-white">₹{selectedPlan.price}<span className="text-lg text-gray-400">/month</span></div>
               </div>
               <p className="text-gray-400 mb-6">
                 Click below to proceed with secure payment via Razorpay
               </p>
               {!razorpayLoaded && (
                 <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                   <p className="text-yellow-400 text-sm">
                     ⚠️ Payment system is loading. Please wait a moment...
                   </p>
                 </div>
               )}
               
               <div className="flex gap-3">
                 <button
                   onClick={() => {
                     setShowPaymentModal(false);
                     setSelectedPlan(null);
                   }}
                   className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors"
                 >
                   Cancel
                 </button>
                 <button
                   onClick={handlePayment}
                   disabled={paymentLoading || !razorpayLoaded}
                   className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                 >
                   {paymentLoading ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       Processing...
                     </>
                   ) : !razorpayLoaded ? (
                     <>
                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                       Loading Payment...
                     </>
                   ) : (
                     <>
                       <FiCreditCard />
                       Pay Now
                     </>
                   )}
                 </button>
               </div>
             </div>
           </motion.div>
        </div>
      )}
    </div>
  );
};

export default PremiumPage;




