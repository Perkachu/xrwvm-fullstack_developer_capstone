import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import reviewbutton_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';

const Dealer = () => {


  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReview, setPostReview] = useState(<></>)

  let curr_url = window.location.href;
  let root_url = curr_url.substring(0,curr_url.indexOf("dealer"));
  let params = useParams();
  let id =params.id;
  let dealer_url = root_url+`djangoapp/dealer/${id}`;
  let reviews_url = root_url+`djangoapp/reviews/dealer/${id}`;
  let post_review = root_url+`postreview/${id}`;
  
  const get_dealer = async ()=>{
    try {
      const res = await fetch(dealer_url, {
        method: "GET"
      });
      const retobj = await res.json();
      
      // Always set dealer data regardless of status code
      // This ensures we display something even with 404 or other error status
      if (retobj.dealer && typeof retobj.dealer === 'object') {
        if (Array.isArray(retobj.dealer)) {
          // Handle array response
          let dealerobjs = Array.from(retobj.dealer);
          if (dealerobjs.length > 0) {
            setDealer(dealerobjs[0]);
          } else {
            setDealer({ 
              full_name: `Dealer #${id}`, 
              message: 'No dealer information available' 
            });
          }
        } else {
          // Handle object response (including error objects)
          // Check if this is a 404 response with our fallback dealer object
          if (retobj.status === 404 && retobj.dealer.full_name) {
            setDealer(retobj.dealer);
          } else {
            setDealer(retobj.dealer);
          }
        }
      } else {
        // Fallback if no dealer data at all
        setDealer({ 
          full_name: `Dealer #${id}`, 
          message: 'No dealer information available' 
        });
      }
    } catch (error) {
      setDealer({ 
        full_name: `Dealer #${id}`, 
        error: error.message,
        message: 'Error loading dealer information' 
      });
    }
  }

  const get_reviews = async ()=>{
    try {
      const res = await fetch(reviews_url, {
        method: "GET"
      });
      const retobj = await res.json();
      
      if(retobj.status === 200) {
        if(retobj.reviews.length > 0){
          setReviews(retobj.reviews)
        } else {
          setUnreviewed(true);
        }
      }
    } catch (error) {
      setUnreviewed(true);
    }
  }

  const senti_icon = (sentiment)=>{
    let icon = sentiment === "positive"?positive_icon:sentiment==="negative"?negative_icon:neutral_icon;
    return icon;
  }

  useEffect(() => {
    // Fetch dealer and review data when component mounts
    get_dealer();
    get_reviews();
    
    // Always set up the Post Review button - it will only be displayed if user is logged in
    setupPostReviewButton();
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps
  
  // Separate function to set up the Post Review button
  const setupPostReviewButton = () => {
    // Check if user is logged in to show post review button
    const username = sessionStorage.getItem("username");
    
    if(username) {
      // Use the template review button image
      setPostReview(
        <a href={post_review} style={{display: 'inline-block', marginLeft: '15px'}}>
          <img 
            src={reviewbutton_icon} 
            style={{width: '60px', height: 'auto'}} 
            alt='Post Review'
            title='Post a review for this dealer'
          />
        </a>
      );
    } else {
      setPostReview(<></>);
    }
  }


return(
  <div style={{margin:"0px"}}>
      <Header/>
      <div style={{marginTop:"10px", padding: '20px'}}>
      {dealer && dealer.full_name ? (
        <div style={{
          backgroundColor: dealer.message ? '#f8f9fa' : 'transparent',
          padding: dealer.message ? '20px' : '0',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: dealer.message ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
        }}>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <h1 style={{color:"#2c3e50", margin: 0}}>{dealer.full_name}</h1>
            <div>{postReview}</div>
          </div>
          
          {dealer.message ? (
            <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px'}}>
              <p style={{color: '#856404', margin: 0}}>
                <strong>Note:</strong> {dealer.message}
              </p>
              <p style={{marginTop: '10px'}}>
                You can still view and post reviews for this dealer.
              </p>
            </div>
          ) : (
            <h4 style={{color:"#7f8c8d", marginTop: '10px'}}>
              {dealer.city || ''}{dealer.city && dealer.address ? ', ' : ''}{dealer.address || ''}
              {(dealer.city || dealer.address) && dealer.zip ? ', Zip - ' : ''}{dealer.zip || ''}{dealer.zip && dealer.state ? ', ' : ''}{dealer.state || ''}
            </h4>
          )}
        </div>
      ) : (
        <div>
          <h2 style={{color:"#2c3e50"}}>Dealer Information</h2>
          {dealer && dealer.error ? (
            <div style={{padding: '15px', backgroundColor: '#f8d7da', borderRadius: '5px', marginBottom: '20px'}}>
              <p style={{color: '#721c24', margin: 0}}>
                <strong>Error:</strong> Could not load dealer information. This might be because the dealer ID is not in the correct format.
              </p>
              <p style={{color: '#721c24', marginTop: '10px', fontSize: '14px'}}>
                Technical details: {dealer.error}
              </p>
            </div>
          ) : (
            <h3 style={{color:"#7f8c8d"}}>Loading dealer information...</h3>
          )}
        </div>
      )}
      </div>
      <div class="reviews_panel">
      {reviews.length === 0 && unreviewed === false ? (
        <text>Loading Reviews....</text>
      ):  unreviewed === true? <div>No reviews yet! </div> :
      reviews.map(review => (
        <div className='review_panel'>
          <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment'/>
          <div className='review'>{review.review}</div>
          <div className="reviewer">{review.name} {review.car_make} {review.car_model} {review.car_year}</div>
        </div>
      ))}
    </div>  
  </div>
)
}

export default Dealer
