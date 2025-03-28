import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"

const Dealers = () => {
  console.log('Dealers component mounted');
  console.log('Current URL:', window.location.href);
  const [dealersList, setDealersList] = useState([]);
  // let [state, setState] = useState("")
  let [states, setStates] = useState([])

  const root_url = window.location.origin;
  const dealer_url = `${root_url}/djangoapp/get_dealers/`;
  
  const dealer_url_by_state = `${root_url}/djangoapp/get_dealers/`;
 
  const filterDealers = async (state) => {
    if (state === "All") {
      get_dealers();
      return;
    }
    const url = `${dealer_url_by_state}${state}`;
    const res = await fetch(url, {
      method: "GET"
    });
    const retobj = await res.json();
    if(retobj.status === 200) {
      // Handle nested dealers structure if it exists
      const dealersData = retobj.dealers.dealers || retobj.dealers;
      
      if(Array.isArray(dealersData)) {
        console.log('Filtered dealers for state', state, ':', dealersData.length);
        let state_dealers = Array.from(dealersData);
        setDealersList(state_dealers);
      } else {
        console.error('Invalid response format for state filtering:', retobj);
        setDealersList([]);
      }
    }
  }

  const get_dealers = async ()=>{
    console.log('Fetching dealers from:', dealer_url);
    try {
      const res = await fetch(dealer_url, {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const retobj = await res.json();
      console.log('Response data:', retobj);
      
      if(retobj.status === 200) {
        // Handle nested dealers structure if it exists
        const dealersData = retobj.dealers.dealers || retobj.dealers;
        
        if(Array.isArray(dealersData)) {
          console.log('Number of dealers:', dealersData.length);
          let all_dealers = Array.from(dealersData);
          let states = all_dealers.map(dealer => dealer.state);
          console.log('States found:', states);
          
          setStates(Array.from(new Set(states)));
          setDealersList(all_dealers);
        } else {
          console.error('Invalid response format:', retobj);
          throw new Error('Invalid response format from server');
        }
      }
    } catch (error) {
      console.error('Error fetching dealers:', error);
      setDealersList([]);
      setStates([]);
    }
  }
  useEffect(() => {
    get_dealers();
  },[]);  


let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
return(
  <div>
      <Header/>

     <table className='table'>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select 
                name="state" 
                id="state" 
                onChange={(e) => filterDealers(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled hidden>State</option>
                <option value="All">All States</option>
                {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                ))}
              </select>        
            </th>
            {isLoggedIn && <th>Review Dealer</th>}
          </tr>
        </thead>
        <tbody>
          {dealersList.map(dealer => (
            <tr key={dealer.id}>
              <td>{dealer.id}</td>
              <td><a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a></td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn && (
                <td>
                  <a href={`/postreview/${dealer.id}`}>
                    <img src={review_icon} className="review_icon" alt="Post Review"/>
                  </a>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
  </div>
)
}

export default Dealers
