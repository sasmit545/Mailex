import axios from 'axios';

//const { UnipileClient } = require("unipile-node-sdk"); // Destructure the class from the module

const ACCESS_TOKEN = "bgoZl4+W.ezMxKlpnFzQpDnC+jVOS6N5EH1+pGdcrAm5Cds7/SCw=";
const BASE_URL = "https://api9.unipile.com:13991";

const getProspects = async (locations, keywords, positions) => {
  const body = {
    locations: locations,
    keywords: keywords, 
    positions: positions,
  };

  return await axios.post(`${process.env.REACT_APP_FUNCTIONS_URL}/getProspects`, body);
};

const getEmail = async (lead) => {
  const body ={
    linkedinURL:lead.linkedinURL,
    sender_name:"John cron",
    sender_details:"CEO at mailex, expertise in digitall marketing "
}
  // const mockMail="Hi Gary,<br><br>I hope this finds you well! I've long admired your thoughtful and innovative approach in navigating the rapidly changing digital landscape. The breadth and depth of the industries you've chosen to invest in, from Facebook to Major League Pickleball, is a testament to your forward-thinking.<br><br>Just recently came across your LinkedIn post about the SlamBall League revival, and I couldn't have been more impressed. Your knack for identifying trends and then capitalizing on them never fails to inspire.<br><br>As the CEO of mailex, I find myself constantly learning from your strategies, insights and acumen. I'd love the opportunity to connect over a brief call and listen to your thoughts on how businesses can better adapt to the ever-evolving demands of consumer attention.<br><br>I'm looking forward to your response; just a phrase or two from you would make my day!<br><br>Take care,<br><br>John Cron<br>CEO, mailex<br>Expertise in Digital Marketing"
  // return mockMail
  return await axios.post(`${process.env.REACT_APP_FUNCTIONS_URL}/generateMail`, body);
};
const sendEmail = async (email_info) => {
  const body = {
    email: email_info.body, // Email content
    subject: email_info.subject, // Email subject
    user_email: email_info.sender_mail, // Sender's email from environment variables
    receiver_email: email_info.to_email, // Recipient's email
    appPassword: email_info.appPassword, // App password for authentication
  };

  try {
    const response = await axios.post(`${process.env.REACT_APP_FUNCTIONS_URL}/sendMail`, body);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    return error.response || { status: 500, message: "Unknown error" };
  }
};

const createcampaign= async(body)=>{
  console.log(body)
  try {
    const response = await axios.post(`https://us-central1-mailex-cfa6e.cloudfunctions.net/createcampaign`, body);
    return response;
  } catch (error) {
    console.error("Error creating campaign:", error);
    return error.response || { status: 500, message: "Unknown error" };
    
  }
}

const warmpupStats=async(body)=>{
  try {
    console.log(body)
    const body1={
      "campaignID":"c1"
    }
    const response = await axios.post(`https://us-central1-mailex-cfa6e.cloudfunctions.net/getStats`,body);
    console.log(response)
    return response.data;
  }
  catch(err){
    console.error("Error fetching warmup stats:", err);


  }
}
const fetchMailboxes=async(uid)=>{
  try {
   
    const response = await axios.get(`https://us-central1-mailex-cfa6e.cloudfunctions.net/getMailboxes?uid=${uid}`);
    console.log(response)
    return response.data;
  }
  catch(err){
    console.error("Error fetching warmup stats:", err);


  }
}
const addLinkedinAccount = async (userId) => {
  const response = await axios.post(
    "https://us-central1-mailex-cfa6e.cloudfunctions.net/createUnipileAuthLink",
    { userId }
  );
  return response.data; // just the URL
};
const removeLinkedinAccount = async (userId) => {
  const response = await axios.post(
    "https://us-central1-mailex-cfa6e.cloudfunctions.net/createUnipileAuthLink",
    { userId }
  );
  return response.data; // just the URL
};



export { getProspects, getEmail, sendEmail,createcampaign,warmpupStats,fetchMailboxes,addLinkedinAccount,removeLinkedinAccount};

