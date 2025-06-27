const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onTaskDispatched } = require("firebase-functions/v2/tasks");

const { getFunctions } = require("firebase-admin/functions");
const { getApp } = require("firebase-admin/app");
const axios = require("axios");
const cors = require('cors')({ origin: true });
const { UnipileClient } = require("unipile-node-sdk");

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const BASE_URL = "https://api9.unipile.com:13991";



const dotenv = require('dotenv');
const OpenAI = require('openai');
dotenv.config();
const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./key.json");




admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.ORG_ID, // This is the default and can be omitted
});





exports.getLinkedinData = onRequest(async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "Missing URL parameter" });
  }

  console.log("LinkedIn profile fetch started");

  const options = {
    method: "GET",
    url: "https://linkedin-api8.p.rapidapi.com/get-profile-data-by-url",
    params: { url },
    headers: {
      "x-rapidapi-key": "78d9ef7540msha9b93eee54e1f13p152c24jsnd2aa3f7566c1",
      "x-rapidapi-host": "linkedin-api8.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const data = response.data;
    res.json({
      username: data.username,
      name: `${data.firstName} ${data.lastName}`,
      position: {
        title: data.fullPositions[0]?.title || "",
        company: data.fullPositions[0]?.companyName || "",
      },
      summary: data.summary,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch LinkedIn profile data" });
  }
});


exports.getFirstPost = onRequest(async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ error: "Missing username parameter" });
  }

  console.log("LinkedIn post fetch started");

  const options = {
    method: "GET",
    url: "https://linkedin-api8.p.rapidapi.com/get-profile-posts",
    params: { username },
    headers: {
      "x-rapidapi-key": "78d9ef7540msha9b93eee54e1f13p152c24jsnd2aa3f7566c1",
      "x-rapidapi-host": "linkedin-api8.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    const posts = response.data.data;
    res.json(posts.length > 0 ? posts[0] : { message: "No posts found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch LinkedIn posts" });
  }
});


exports.getProspects = onRequest(async (request, response) => {
  cors(request, response, async () => {
    const {
      keywords, // array
      positions, // required: array
      locations, // required: array (organization_locations)
      person_seniorities,
      person_locations,
      include_similar_titles = true,
      q_organization_domains_list,
      organization_ids,
      organization_num_employees_ranges,
      page,
      per_page
    } = request.body;
  
  
  
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'x-api-key': process.env.APOLLO_API_KEY
      },
    };
  
    // Base URL
    let peopleUrl = `https://api.apollo.io/api/v1/mixed_people/search?`;
  
    //keywords
  
  
    // Required filters
    if (positions && Array.isArray(positions)) {
      positions.forEach(title => {
        peopleUrl += `person_titles[]=${encodeURIComponent(title)}&`;
      });
    }
    if (locations && Array.isArray(locations)) {
      locations.forEach(location => {
        peopleUrl += `organization_locations[]=${encodeURIComponent(location)}&`;
      });
    }
    //keywords
    if (keywords && Array.isArray(keywords)) {
      keywords.forEach(keyword => {
        peopleUrl += `keywords[]=${encodeURIComponent(keyword)}&`;
      });
    }
  
  
    // Optional filters
    if (person_seniorities && Array.isArray(person_seniorities)) {
      person_seniorities.forEach(sen => {
        peopleUrl += `person_seniorities[]=${encodeURIComponent(sen)}&`;
      });
    }
  
    if (person_locations && Array.isArray(person_locations)) {
      person_locations.forEach(loc => {
        peopleUrl += `person_locations[]=${encodeURIComponent(loc)}&`;
      });
    }
  
    if (q_organization_domains_list && Array.isArray(q_organization_domains_list)) {
      q_organization_domains_list.forEach(domain => {
        peopleUrl += `q_organization_domains_list[]=${encodeURIComponent(domain)}&`;
      });
    }
  
    if (organization_ids && Array.isArray(organization_ids)) {
      organization_ids.forEach(id => {
        peopleUrl += `organization_ids[]=${encodeURIComponent(id)}&`;
      });
    }
  
    if (organization_num_employees_ranges && Array.isArray(organization_num_employees_ranges)) {
      organization_num_employees_ranges.forEach(range => {
        peopleUrl += `organization_num_employees_ranges[]=${encodeURIComponent(range)}&`;
      });
    }
  
    // Email status filters
    peopleUrl += `contact_email_status[]=verified&contact_email_status[]=likely%20to%20engage&`;
  
  
    // Include similar titles (boolean)
    peopleUrl += `include_similar_titles=${include_similar_titles}&`;
  
    // Pagination
    if (page) {
      peopleUrl += `page=${page}&`;
    }
    if (per_page) {
      peopleUrl += `per_page=${per_page}&`;
    }
  
  
    try {
      const peopleResult = await axios(peopleUrl, options);
  
      if (!peopleResult.data.people || peopleResult.data.people.length === 0) {
        return response.status(404).json({
          error: 'No people found',
        });
      }
  
      const people = peopleResult.data.people.map((person) => ({
        name: person.name,
        linkedin_url: person.linkedin_url,
        email: person.email,
        country: person.country,
        city: person.city,
        organization_name: person.organization?.name,
        title: person.title,
        id: person.id
      }));
  
      return response.json(people);
    } catch (error) {
      console.error('Getting prospects failed:', error?.response?.data || error.message);
      return response.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  
});

exports.saveLeads = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const {
        numLeads,
        keywords,
        positions,
        locations,
        person_seniorities,
        person_locations,
        include_similar_titles = true,
        q_organization_domains_list,
        organization_ids,
        organization_num_employees_ranges,
        userid,
        lead_name
      } = req.body;

      // Check if lead_name already exists with the userID
      const leadQuery = await db
        .collection("marketings")
        .where("userID", "==", userid)
        .where("name", "==", lead_name)
        .limit(1)
        .get();

      if (!leadQuery.empty) {
        return res.status(400).json({ error: "List name already exists" });
      }

      const defaultPerPage = 100;
      const pages = Math.ceil(numLeads / defaultPerPage);
      const leads = [];
      const errors = [];

      // Fetch leads from prospect API
      for (let i = 0; i < pages; i++) {
        const remaining = numLeads - leads.length;
        const per_page = Math.min(defaultPerPage, remaining);

        const url = "https://us-central1-mailex-cfa6e.cloudfunctions.net/getProspects";

        // Create request body with only defined parameters
        const body = {
          page: i + 1,
          per_page
        };

        // Only add parameters that exist
        if (keywords) body.keywords = keywords;
        if (positions) body.positions = positions;
        if (locations) body.locations = locations;
        if (person_seniorities) body.person_seniorities = person_seniorities;
        if (person_locations) body.person_locations = person_locations;
        if (typeof include_similar_titles !== "undefined") body.include_similar_titles = include_similar_titles;
        if (q_organization_domains_list) body.q_organization_domains_list = q_organization_domains_list;
        if (organization_ids) body.organization_ids = organization_ids;
        if (organization_num_employees_ranges) body.organization_num_employees_ranges = organization_num_employees_ranges;

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error ${response.status}: ${errorText}`);
          }

          const data = await response.json();

          if (data.error) {
            errors.push(`Error on page ${i + 1}: ${data.error}`);
            console.warn(`Error on page ${i + 1}:`, data.error);
            continue;
          }

          // Make sure data is an array before pushing
          if (Array.isArray(data)) {
            leads.push(...data);
          } else if (data.results && Array.isArray(data.results)) {
            leads.push(...data.results);
          } else {
            errors.push(`Invalid data format on page ${i + 1}`);
            console.warn(`Invalid data format on page ${i + 1}`, data);
            continue;
          }

          if (leads.length >= numLeads) break;
        } catch (err) {
          errors.push(`Fetch failed on page ${i + 1}: ${err.message}`);
          console.error(`Fetch failed on page ${i + 1}:`, err);
          continue;
        }
      }

      const trimmedLeads = leads.slice(0, numLeads);

      // Fetch email information for each lead
      for (let i = 0; i < trimmedLeads.length; i++) {
        try {
          const lead_id = trimmedLeads[i].id; // Make sure to use the correct property for the ID

          const url = `https://api.apollo.io/api/v1/people/match?id=${lead_id}&reveal_personal_emails=true&reveal_phone_number=false`;
          const options = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json',
              'x-api-key': process.env.APOLLO_API_KEY
            }
          };

          const response = await fetch(url, options);

          if (!response.ok) {
            console.warn(`Failed to fetch email for lead ${lead_id}: ${response.status}`);
            continue;
          }

          const data = await response.json();

          if (data && data.person && data.person.email) {
            trimmedLeads[i].email = data.person.email;
          }
        } catch (err) {
          console.error(`Error fetching email for lead ${i}:`, err);
          // Continue with next lead instead of breaking the entire process
        }
      }

      // Create timestamp for the record
      const timestamp = new Date();

      // Save to database
      const docRef = await db.collection("marketings").add({
        userID: userid,
        leads: trimmedLeads,
        name: lead_name,
        createdAt: timestamp,
        leadCount: trimmedLeads.length
      });

      res.status(200).json({
        success: true,
        totalFetched: trimmedLeads.length,
        leads: trimmedLeads,
        errors: errors.length > 0 ? errors : undefined,
        docId: docRef.id
      });
    } catch (err) {
      console.error("Unhandled error:", err);
      res.status(500).json({
        success: false,
        error: err.message || "Internal server error"
      });
    }
  });
});
exports.addmailbox = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { email, userID, type, info } = req.body;

      if (!email || !info.password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const API_KEY = process.env.MAILIVERY_API_KEY;

      if (type === 'gmail') {
        const body = {
          app_password: info.password,
          mail: email,
          first_name: info.first_name,
          last_name: info.last_name,
          email_per_day: 100,
          response_rate: 25
        };

        // const response = await fetch('https://app.mailivery.io/api/v1/campaigns/gmail', {
        //   method: 'POST',
        //   headers: {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${API_KEY}`
        //   },
        //   body: JSON.stringify(body)
        // });

        // const result = await response.json();

        // if (!response.ok) {
        //   console.error("Mailivery Gmail error:", result);
        //   return res.status(500).json({ error: "Mailivery Gmail API error", detail: result });
        // }

        await db.collection("mailbox").add({
          email,
          app_password: info.password,
          createdBy: userID,
          type,
          first_name: info.first_name,
          last_name: info.last_name,
          email_per_day: 100,
          response_rate: 25,
          campaignID: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          warmup: true
        });

        return res.status(201).json({ message: "Gmail mailbox added successfully" });
      }

      else if (type === 'smtp') {
        const body = {
          mail: email,
          app_password: info.password,
          first_name: info.first_name,
          last_name: info.last_name,
          email_per_day: 100,
          response_rate: 25,
          imap_email: info.imap_email,
          imap_host: info.imap_host,
          imap_password: info.imap_password,
          imap_port: info.imap_port,
          imap_username: info.imap_username,
          smtp_host: info.smtp_host,
          smtp_password: info.smtp_password,
          smtp_port: info.smtp_port,
          smtp_username: info.smtp_username,
          warmup: true
        };

        // const response = await fetch('https://app.mailivery.io/api/v1/campaigns/smtp', {
        //   method: 'POST',
        //   headers: {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${API_KEY}`
        //   },
        //   body: JSON.stringify(body)
        // });

        // const result = await response.json();

        // if (!response.ok) {
        //   console.error("Mailivery SMTP error:", result);
        //   return res.status(500).json({ error: "Mailivery SMTP API error", detail: result });
        // }

        await db.collection("mailbox").add({
          createdBy: userID,
          type,
          mail: email,
          campaignID: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
          app_password: info.password,
          first_name: info.first_name,
          last_name: info.last_name,
          email_per_day: 100,
          response_rate: 25,
          imap_email: info.imap_email,
          imap_host: info.imap_host,
          imap_password: info.imap_password,
          imap_port: info.imap_port,
          imap_username: info.imap_username,
          smtp_host: info.smtp_host,
          smtp_password: info.smtp_password,
          smtp_port: info.smtp_port,
          smtp_username: info.smtp_username,
          warmup: true,

        });

        return res.status(201).json({ message: "SMTP mailbox added successfully" });
      }

      return res.status(400).json({ error: "Invalid mailbox type" });

    } catch (error) {
      console.error("Error adding mailbox:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});
exports.startWarmup = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { campaignID } = req.body;

      if (!campaignID) {
        return res.status(400).json({ error: "CampaignID missing" });
      }

      // Query for the mailbox with the matching campaignID
      const mailboxQuery = await db
        .collection("mailbox")
        .where("campaignID", "==", campaignID)
        .limit(1)
        .get();

      if (mailboxQuery.empty) {
        return res.status(404).json({ error: "Mailbox not found" });
      }

      const mailboxDoc = mailboxQuery.docs[0];
      const mailboxData = mailboxDoc.data();

      if (mailboxData.warmup === true) {
        return res.status(400).json({ error: "Mailbox is already warmed up" });
      }

      // const url = `https://app.mailivery.io/api/v1/campaigns/${campaignID}/start-warmup`;
      // const options = {
      //   method: "PATCH",
      //   headers: {
      //     Accept: "application/json",
      //     Authorization: `Bearer ${process.env.MAILIVERY_API_KEY}`,
      //   },
      // };

      // const response = await fetch(url, options);
      // const result = await response.json();

      // if (!response.ok) {
      //   console.error("Mailivery warmup error:", result);
      //   return res.status(500).json({ error: "Warmup error", detail: result });
      // }

      await mailboxDoc.ref.update({ warmup: true });

      return res
        .status(200)
        .json({ message: "Mailbox warmup started successfully" });

    } catch (error) {
      console.error("Error starting warmup:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});


exports.resumeWarmup = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { campaignID } = req.body;

      if (!campaignID) {
        return res.status(400).json({ error: "CampaignID missing" });
      }

      // Query mailbox by campaignID
      const mailboxQuery = await db
        .collection("mailbox")
        .where("campaignID", "==", campaignID)
        .limit(1)
        .get();

      if (mailboxQuery.empty) {
        return res.status(404).json({ error: "Mailbox not found" });
      }

      const mailboxDoc = mailboxQuery.docs[0];
      const mailboxData = mailboxDoc.data();

      if (mailboxData.warmup === true) {
        return res.status(400).json({ error: "Mailbox is already warmed up" });
      }

      // const url = `https://app.mailivery.io/api/v1/campaigns/${campaignID}/resume-warmup`;
      // const options = {
      //   method: 'PATCH',
      //   headers: {
      //     Accept: 'application/json',
      //     Authorization: `Bearer ${process.env.MAILIVERY_API_KEY}`,
      //   },
      // };

      // const response = await fetch(url, options);
      // const result = await response.json();

      // if (!response.ok) {
      //   console.error("Mailivery resume warmup error:", result);
      //   return res.status(500).json({ error: "Warmup error", detail: result });
      // }

      await mailboxDoc.ref.update({ warmup: true });

      return res.status(200).json({ message: "Mailbox warmup resumed successfully" });

    } catch (error) {
      console.error("Error resuming warmup:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

exports.pauseWarmup = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { campaignID } = req.body;

      if (!campaignID) {
        return res.status(400).json({ error: "CampaignID missing" });
      }

      // Query mailbox by campaignID
      const mailboxQuery = await db
        .collection("mailbox")
        .where("campaignID", "==", campaignID)
        .limit(1)
        .get();

      if (mailboxQuery.empty) {
        return res.status(404).json({ error: "Mailbox not found" });
      }

      const mailboxDoc = mailboxQuery.docs[0];
      const mailboxData = mailboxDoc.data();

      if (mailboxData.warmup === false) {
        return res.status(400).json({ error: "Mailbox is already paused" });
      }

      // const url = `https://app.mailivery.io/api/v1/campaigns/${campaignID}/pause-warmup`;
      // const options = {
      //   method: 'PATCH',
      //   headers: {
      //     Accept: 'application/json',
      //     Authorization: `Bearer ${process.env.MAILIVERY_API_KEY}`,
      //   },
      // };

      // const response = await fetch(url, options);
      // const result = await response.json();

      // if (!response.ok) {
      //   console.error("Mailivery pause warmup error:", result);
      //   return res.status(500).json({ error: "Warmup pause error", detail: result });
      // }

      await mailboxDoc.ref.update({ warmup: false });

      return res.status(200).json({ message: "Mailbox warmup paused successfully" });

    } catch (error) {
      console.error("Error pausing warmup:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

exports.getStats = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { campaignID } = req.body;
      if (!campaignID) {
        return res.status(400).json({ error: "Missing campaignID in query params" });
      }

      // Query Firestore for the campaign
      const campaignRef = db.collection("mailbox").where("campaignID", "==", campaignID);
      const campaignSnapshot = await campaignRef.get();

      if (campaignSnapshot.empty) {
        console.log("err")
        return res.status(404).json({ error: "Campaign not found" });
      }

      const campaign = campaignSnapshot.docs[0].data(); // Get the first matching document
      const campaignId = campaign.campaignID;

      // const url_metrics = `https://app.mailivery.io/api/v1/campaigns/${campaignId}/get-metrics`;
      // const url_score = `https://app.mailivery.io/api/v1/campaigns/${campaignId}/get-health-score`;

      // const options = {
      //   method: 'PATCH', // Keeping PATCH as per your request
      //   headers: {
      //     Accept: 'application/json',
      //     Authorization: `Bearer ${process.env.MAILIVERY_API_KEY}`
      //   }
      // };

      // // Fetch both metrics and health score concurrently
      // const [response_metrics, response_score] = await Promise.all([
      //   fetch(url_metrics, options),
      //   fetch(url_score, options)
      // ]);

      // const result_metrics = await response_metrics.json();
      // const result_score = await response_score.json();

      // return res.status(200).json({
      //   campaignID: campaignId,
      //   metrics: result_metrics.data,
      //   health_score: result_score.data
      // });

      const result_metrics = {
        "data": {
          "2024-04-26": {
            "Warm Up": {
              "Total": 7,
              "landed In": {
                "inbox": 7
              }
            },
            "Replies": {
              "Total": 3,
              "landed In": {
                "inbox": 3
              }
            }
          },
          "2024-04-29": {
            "Warm Up": {
              "Total": 8,
              "landed In": {
                "inbox": 5,
                "not_found_or_deleted": 2,
                "trash": 1
              }
            },
            "Replies": {
              "Total": 2,
              "landed In": {
                "inbox": 1,
                "not_found_or_deleted": 1
              }
            }
          },
          "2024-04-30": {
            "Warm Up": {
              "Total": 7,
              "landed In": {
                "inbox": 5,
                "not_found_or_deleted": 2
              }
            },
            "Replies": {
              "Total": 3,
              "landed In": {
                "inbox": 3
              }
            }
          },
          "2024-05-01": {
            "Warm Up": {
              "Total": 6,
              "landed In": {
                "inbox": 6
              }
            },
            "Replies": {
              "Total": 4,
              "landed In": {
                "inbox": 3,
                "not_found_or_deleted": 1
              }
            }
          },
          "2024-05-02": {
            "Warm Up": {
              "Total": 9,
              "landed In": {
                "inbox": 8,
                "not_found_or_deleted": 1
              }
            },
            "Replies": {
              "Total": 1,
              "landed In": {
                "inbox": 1
              }
            }
          },
          "2024-05-03": {
            "Warm Up": {
              "Total": 6,
              "landed In": {
                "inbox": 5,
                "not_found_or_deleted": 1
              }
            },
            "Replies": {
              "Total": 4,
              "landed In": {
                "inbox": 3,
                "not_found_or_deleted": 1
              }
            }
          },
          "2024-05-06": {
            "Warm Up": {
              "Total": 9,
              "landed In": {
                "inbox": 7,
                "not_found_or_deleted": 1,
                "#8mi mailivery": 1
              }
            },
            "Replies": {
              "Total": 1,
              "landed In": {
                "inbox": 1
              }
            }
          },
          "2024-05-07": {
            "Warm Up": {
              "Total": 10,
              "landed In": {
                "spam": 1,
                "inbox": 8,
                "*FAILED_TO_READ*": 1
              }
            },
            "Replies": {
              "total": null,
              "landed in": null
            }
          },
          "2024-05-08": {
            "Warm Up": {
              "Total": 8,
              "landed In": {
                "inbox": 6,
                "mailivery": 1,
                "*FAILED_TO_READ*": 1
              }
            },
            "Replies": {
              "Total": 2,
              "landed In": {
                "inbox": 2
              }
            }
          },
          "2024-05-09": {
            "Warm Up": {
              "Total": 6,
              "landed In": {
                "inbox": 5,
                "trash": 1
              }
            },
            "Replies": {
              "Total": 4,
              "landed In": {
                "inbox": 4
              }
            }
          },
          "2024-05-10": {
            "Warm Up": {
              "Total": 6,
              "landed In": {
                "inbox": 5,
                "spam": 1
              }
            },
            "Replies": {
              "Total": 4,
              "landed In": {
                "inbox": 4
              }
            }
          }
        },
        "success": true,
        "status": 200,
        "code": "GET_METRICS_SUCCESSFULL",
        "message": "Campaign Metrics fetched successful"
      }
      const result_score = {
        "data": {
          "grade": "A",
          "spf": "valid",
          "dmarc": "valid",
          "mx": "valid",
          "domain_age": 10931
        },
        "success": true,
        "status": 200,
        "code": "GET_HEALTHSCORE_SUCCESSFULL",
        "message": "Campaign healthscore fetched successful"
      }

      return res.status(200).json({
        campaignID: campaignId,
        metrics: result_metrics.data,
        health_score: result_score.data
      });

    } catch (error) {
      console.error("Error getting stats:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        detail: error.message
      });
    }
  });
});

exports.getMailboxes = onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== "GET") {
      return res.status(405).send("Method Not Allowed");
    }

    const { uid } = req.query; // Use query param instead of body for GET

    try {
      let query = db.collection("mailbox");

      // Optional: If uid is used to filter mailboxes
      if (uid) {
        query = query.where("createdBy", "==", uid);
      }

      const snapshot = await query.get();

      const mailboxes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({ mailboxes });
    } catch (error) {
      console.error("Error fetching mailboxes:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});



exports.extractInfo = onRequest(
  async (req, res) => {
    cors(req, res, async () => {

      const { questions, campaign_type } = req.body;

      let result = '';
      try {
        if (campaign_type === 'sales') {
          const product_prompt = `
#  Role
You are a specialized AI agent trained in high - precision information extraction.Your role is to extract factual, structured data specifically related to a  product  and its  associated company or brand  from a given user question and answer.

#  Task
Extract only the  explicit  and  relevant  information about:
- The  product  the user wants to sell.
- The  company  or  brand  related to the product.

# Critical Instructions
        - Do  not  include any introduction, explanation, or closing text.
- Do  not  infer or guess missing information — extract only what is clearly mentioned.
- Maintain a neutral, fact - based tone with no additional commentary.
- Follow the exact output format shown below.

# Output Format
Use this structure  exactly :

Product:
- [Detail]
- [Detail]

Company:
- [Detail]
- [Detail]


#  Importance
This extraction task is mission - critical.Inaccuracies or omissions may result in downstream errors, miscommunication, or loss of business value.Precision is non - negotiable.

       `
          const audience_prompt =
            `
      You are an expert in extracting structured marketing insights from text.

Your task is to extract only the explicitly mentioned details about the target audience based on the user's question and answer.

Focus on extracting:
1. Audience type (e.g. individuals, small businesses, enterprises)
2. Industry or niche
3. Pain points or needs

Do not include explanations, assumptions, or extra text.

Respond only in this exact format:

Target Audience:
- Type: [value]
- Industry/Niche: [value]
- Pain Points/Needs: [value]

      `

          const campaign_prompt = `
      You are an expert in extracting structured marketing insights from text.

You will receive a list of question and answer pairs about an email campaign. Your task is to extract only the explicitly stated information related to the campaign's objective.

Focus on extracting:
1. Primary Goal of the campaign
2. Specific Call to Action
3. Key Message or Value Proposition

Do not include explanations, assumptions, or extra text.
Do not rephrase the content — extract directly from the answers when possible.

Respond only in this exact format:

Campaign Objective:
- Primary Goal: [value]
- Call to Action: [value]
- Key Message: [value]

      `
          const value_prompt = `You are an expert in extracting structured positioning and differentiation insights from text.

You will receive a list of question and answer pairs about a product's value proposition. Your task is to extract only the explicitly stated information related to differentiation and objection-handling.

Focus on extracting:
1. Unique Selling Points (what sets the product apart)
2. Common Objections from the target audience
3. How the product addresses those objections

Do not include any explanations, assumptions, or rephrasings.
Only use what is clearly mentioned in the answers.

Respond only in this exact format:

Value Proposition & Differentiation:
- Unique Selling Points: [value]
- Common Objections: [value]
- Objection Handling: [value]
`

          const personalization_prompt = `
You are an expert in extracting personalization insights from marketing content.

You will receive a list of question and answer pairs related to personalization and context. Your task is to extract only the explicitly mentioned information for use in personalized email campaigns.

Focus on extracting:
1. Trends or contextual references to include
2. Case studies or stats for credibility
3. Competitor tools to mention or reference

Do not include explanations, assumptions, or extra text.

Respond only in this exact format:

Personalization & Context:
- Trends/References: [value]
- Case Studies/Stats: [value]
- Competitor Mentions: [value]
`
          const tone_prompt = `You are an expert in extracting tone and communication preferences for marketing emails.

You will receive a list of question and answer pairs. Your task is to extract only the clearly mentioned instructions regarding tone, style, and preferences.

Focus on extracting:
1. Desired tone
2. Call-to-action links or tools
3. Phrases or angles to avoid
4. Signature, tagline, or P.S. content

Only extract what is explicitly stated. No assumptions, no added context.

Respond only in this exact format:

Tone & Preferences:
- Tone: [value]
- CTA/Links: [value]
- Avoid: [value]
- Signature/P.S.: [value]
`


          const [
            productInfo,
            audienceInfo,
            campaignInfo,
            valueInfo,
            personalizationInfo,
            toneInfo
          ] = await Promise.all([
            client.chat.completions.create({
              messages: [
                { role: "system", content: product_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[0])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: audience_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[1])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: campaign_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[2])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: value_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[3])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: personalization_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[4])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: tone_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[5])}` }
              ],
              model: "gpt-4o"
            })
          ]);

          const clean = (text) =>
            text?.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim() || '';




          result = {
            product: clean(productInfo.choices[0]?.message?.content),
            audience: clean(audienceInfo.choices[0]?.message?.content),
            campaign: clean(campaignInfo.choices[0]?.message?.content),
            value: clean(valueInfo.choices[0]?.message?.content),
            personalization: clean(personalizationInfo.choices[0]?.message?.content),
            tone: clean(toneInfo.choices[0]?.message?.content)
          };


        }
        else if (campaign_type === 'networking') {

          const personal_prompt = `
You are an expert in extracting structured personal background insights for networking outreach.

Your task is to extract clearly stated details from the user about themselves and their reason for reaching out.

Extract:
1. Name, role, and company of the sender
2. Reason for reaching out
3. Any shared context (events, alma mater, mutuals)

Respond only in this exact format:

Personal Background:
- Name/Role/Company: [value]
- Reason for Reaching Out: [value]
- Shared Context: [value]
`;

          const contact_prompt = `
You are an expert in extracting structured contact targeting data for networking outreach.

Your task is to extract clearly stated details about the person the user is trying to connect with.

Extract:
1. Name, role, and company of the target
2. What interests the sender about them

Respond only in this exact format:

Target Contact:
- Name/Role/Company: [value]
- Interest in Contact: [value]
`;

          const campaign_prompt = `
You are an expert in extracting structured campaign goals for networking emails.

Your task is to extract only the explicitly stated information related to the campaign's objective.

Extract:
1. Primary goal of the outreach (e.g., advice, collaboration)
2. Preferred method to continue the conversation

Respond only in this exact format:

Campaign Objective:
- Goal: [value]
- Follow-up Method: [value]
`;

          const tone_prompt = `
You are an expert in extracting tone and communication preferences for networking outreach.

Your task is to extract clearly mentioned preferences around tone, topic, and structure.

Extract:
1. Desired tone (friendly, casual, professional)
2. Topic/context to mention in the intro
3. Link or open-ended follow-up

Respond only in this exact format:

Tone & Preferences:
- Tone: [value]
- Intro Context: [value]
- Follow-up Style: [value]
`;
          const [
            personalInfo,
            contactInfo,
            campaignInfo,
            toneInfo
          ] = await Promise.all([
            client.chat.completions.create({
              messages: [
                { role: "system", content: personal_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[0])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: contact_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[1])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: campaign_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[2])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: tone_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[3])}` }
              ],
              model: "gpt-4o"
            })
          ]);

          const clean = (text) =>
            text?.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim() || '';

          result = {
            personal: clean(personalInfo.choices[0]?.message?.content),
            contact: clean(contactInfo.choices[0]?.message?.content),
            campaign: clean(campaignInfo.choices[0]?.message?.content),
            tone: clean(toneInfo.choices[0]?.message?.content)
          };


        }
        else if (campaign_type === 'partnership') {
          const company_prompt = `
You are an expert in extracting structured information about companies for partnership outreach.

Your task is to extract clearly stated details about the sender's company and past collaborations.

Extract:
1. Company name and what it does
2. Core product or service
3. Past partnership experiences that worked well

Respond only in this exact format:

Company & Product Context:
- Company Name / Description: [value]
- Core Product/Service: [value]
- Past Partnerships: [value]
`;

          const partner_prompt = `
You are an expert in identifying ideal partner profiles for business collaborations.

Your task is to extract clear information about the kind of company/person the sender is looking to collaborate with.

Extract:
1. Ideal partner profile
2. Why this specific company/person is a good fit

Respond only in this exact format:

Target Partner:
- Ideal Partner: [value]
- Reason for Fit: [value]
`;

          const campaign_prompt = `
You are an expert in structuring partnership objectives for outreach campaigns.

Your task is to extract the sender's proposed type of collaboration and expected value from both sides.

Extract:
1. Type of partnership proposed
2. Mutual value being offered
3. What success looks like

Respond only in this exact format:

Campaign Objective:
- Type of Partnership: [value]
- Mutual Value: [value]
- Success Outcome: [value]
`;

          const tone_prompt = `
You are an expert in tailoring outreach tone and personalization for collaboration campaigns.

Your task is to extract:
1. Any specific shared tools, audience, or values to reference
2. Preferred tone for communication

Respond only in this exact format:

Personalization & Tone:
- Common Ground: [value]
- Tone: [value]
`;

          const [
            companyInfo,
            partnerInfo,
            campaignInfo,
            toneInfo
          ] = await Promise.all([
            client.chat.completions.create({
              messages: [
                { role: "system", content: company_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[0])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: partner_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[1])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: campaign_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[2])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: tone_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[3])}` }
              ],
              model: "gpt-4o"
            })
          ]);

          const clean = (text) =>
            text?.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim() || '';

          result = {
            company: clean(companyInfo.choices[0]?.message?.content),
            partner: clean(partnerInfo.choices[0]?.message?.content),
            campaign: clean(campaignInfo.choices[0]?.message?.content),
            tone: clean(toneInfo.choices[0]?.message?.content)
          };


        }
        else if (campaign_type === 'investor') {
          const company_prompt = `
You're an expert in summarizing startup profiles for investor communications.

Extract from the answers:
1. Company name and what it does
2. Core product or service
3. Current fundraising stage
4. Current investors (if any)

Respond only in this exact format:

Company & Product Context:
- Company: [value]
- Product/Service: [value]
- Fundraising Stage: [value]
- Current Investors: [value]
`;

          const traction_prompt = `
You're an expert in highlighting key traction and growth metrics for fundraising emails.

From the responses, extract:
1. Major traction (revenue, users, growth)
2. Key recent milestones

Respond only in this exact format:

Traction & Metrics:
- Traction: [value]
- Milestones: [value]
`;

          const campaign_prompt = `
You are helping founders articulate their fundraising outreach objectives.

From the given answers, extract:
1. Amount being raised and purpose
2. Reason for targeting this investor
3. Ideal next step after this outreach

Respond only in this exact format:

Campaign Objective:
- Raise & Purpose: [value]
- Reason for Targeting Investor: [value]
- Ideal Next Step: [value]
`;

          const differentiation_prompt = `
You're a startup pitch coach helping founders highlight their unique positioning and long-term vision.

Extract:
1. Why the startup or team is uniquely positioned to win
2. What long-term vision or impact they want to convey

Respond only in this exact format:

Differentiation & Vision:
- Unique Edge: [value]
- Vision/Impact: [value]
`;

          const tone_prompt = `
You're an expert in adapting tone and asset inclusion for investor emails.

From the given responses, extract:
1. Desired tone (e.g., formal, visionary, confident)
2. Assets to include (e.g., pitch deck, product link, calendar link)

Respond only in this exact format:

Tone & Preferences:
- Tone: [value]
- Assets: [value]
`;
          const [
            companyInfo,
            tractionInfo,
            campaignInfo,
            diffInfo,
            toneInfo
          ] = await Promise.all([
            client.chat.completions.create({
              messages: [
                { role: "system", content: company_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[0])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: traction_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[1])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: campaign_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[2])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: differentiation_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[3])}` }
              ],
              model: "gpt-4o"
            }),
            client.chat.completions.create({
              messages: [
                { role: "system", content: tone_prompt },
                { role: "user", content: `Questions and answers:\n${JSON.stringify(questions[4])}` }
              ],
              model: "gpt-4o"
            })
          ]);

          const clean = (text) =>
            text?.replace(/\n/g, ' ').replace(/\t/g, ' ').replace(/\s+/g, ' ').trim() || '';

          result = {
            company: clean(companyInfo.choices[0]?.message?.content),
            traction: clean(tractionInfo.choices[0]?.message?.content),
            campaign: clean(campaignInfo.choices[0]?.message?.content),
            differentiation: clean(diffInfo.choices[0]?.message?.content),
            tone: clean(toneInfo.choices[0]?.message?.content)
          };

        }
        else {
          // return erro
          res.status(400).json({ error: "wrong type" });

        }

        const summary_prompt = `
        # Role
        You are a marketing assistant specialized in summarizing cold email campaigns.
        
        # Task
        You will be given a JSON object containing detailed inputs about a cold email campaign. Your task is to extract and summarize the key points clearly and concisely. 
 
        Avoid unnecessary repetition. Be concise, clear, and insightful.
        
        # Output Format
        Return a short summary in plain text (no JSON, no markdown, no pretext or posttext).
        `
        // Generate final summary
        const summary = await client.chat.completions.create({
          messages: [
            { role: "system", content: summary_prompt },
            { role: "user", content: `Extracted Information:\n${JSON.stringify(result)}` }
          ],
          model: "gpt-4o"
        });


        // Return the extracted information
        res.status(200).json({
          "summary": summary.choices[0].message.content,
          "extracted_info": result
        });

      } catch (error) {
        console.error("Error in API call:", error);
        res.status(500).json({ error: "Failed to Extract Info", details: error.message });
      }
    });
  });







exports.generateMailbody = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { firstPost, name, job, summary, campaign_type, extracted_info } = req.body;

      const receiver_name = name;
      const receiver_job = job;
      const receiver_summary = summary;
      const latest_linkedin_post = firstPost;

      let mailPrompt = '';

      if (campaign_type === 'sales') {
        // Extract structured data from extracted_info
        const { product, audience, campaign, value, personalization, tone } = extracted_info;

        mailPrompt = `
          # Role
          You are the world's leading expert on cold sales emails with a 70%+ open rate and 15%+ response rate. Your emails have generated millions in revenue.
          
          # Task
          Craft a high-converting sales email that would actually get a response from a busy executive.
          
          # Context
          - You're writing to ${receiver_name}, who works as ${receiver_job}.
          - About the recipient: ${receiver_summary}
          - Their latest LinkedIn post: "${latest_linkedin_post}"
          
          # Sales Email Information
          ${product}
          
          ${audience}
          
          ${campaign}
          
          ${value}
          
          ${personalization}
          
          ${tone}
          
          # Email Writing Rules
          1. NEVER use weak, boring opening lines (no "I hope this email finds you well" or "My name is...")
          2. Start by referencing something specific from their LATEST LINKEDIN POST to create immediate relevance
          3. Reference 1-2 specific details from their background or LinkedIn activity that relate to your value proposition
          4. Keep the entire email between 140-170 words - professional but not overwhelming
          5. Focus on ONE clear value proposition with 1-2 specific benefits/outcomes
          6. Include social proof (client result, metric, testimonial) when possible
          7. Use a question-based CTA that's easy to respond to (not "Let me know if interested")
          8. Make at least 60% of the email about THEM and their specific situation/challenges
          9. Write in a conversational, direct tone as if speaking to a colleague
          10. Use short paragraphs (1-2 sentences max) and plenty of white space for mobile readability
          11. Include a P.S. with an additional value point or reference to their LinkedIn content
          
          # Critical
          - Return ONLY the email body - no subject line or explanations
          - This email MUST feel like it was written specifically for ${receiver_name} at their company
          - Reference their LinkedIn post in a natural way that connects to your offering
          - Avoid ALL generic sales language and clichés
          - Write this email as if your job depends on getting a response
        `;
      }
      else if (campaign_type === 'networking') {
        // Extract structured data from extracted_info
        const { personal, contact, campaign, tone } = extracted_info;

        mailPrompt = `
          # Role
          You are an expert networking strategist who has helped thousands of professionals build meaningful relationships with 80%+ response rates.
          
          # Task
          Create a personalized networking email that would actually receive a response from ${receiver_name}.
          
          # Context
          - You're writing to ${receiver_name}, who works as ${receiver_job}.
          - About the recipient: ${receiver_summary}
          - Their latest LinkedIn post: "${latest_linkedin_post}"
          
          # Networking Email Information
          ${personal}
          
          ${contact}
          
          ${campaign}
          
          ${tone}
          
          # Email Writing Rules
          1. Start by directly engaging with a point from their LATEST LINKEDIN POST
          2. Include 1-2 thoughtful observations about their career path or professional interests
          3. Establish credibility quickly but humbly (who you are without bragging)
          4. Create a genuine connection through shared interests, experiences, or goals
          5. Make the reason for connecting crystal clear - be specific about what you admire/want to learn
          6. Keep the email between 120-150 words - concise but allowing for personalization
          7. Show that you've thoughtfully considered their LinkedIn content, not just glanced at it
          8. Include a precise, low-pressure ask that's easy to say yes to
          9. End with a warm, unique sign-off that matches your relationship goal
          10. Use natural language that sounds like a human, not marketing copy
          11. At least 70% of the email should focus on them and their work/accomplishments
          
          # Critical
          - Return ONLY the email body - no subject line or explanations
          - This email MUST feel authentically personal and not mass-produced
          - Reference their LinkedIn post in a way that shows genuine interest in their thoughts
          - The networking request should provide value to THEM, not just to you
          - Write this email as if your career networking depends on getting a response
        `;
      }
      else if (campaign_type === 'partnership') {
        // Extract structured data from extracted_info
        const { company, partner, campaign, tone } = extracted_info;

        mailPrompt = `
          # Role
          You are a partnership development expert who has secured over 100 high-value business partnerships with a 65% response rate.
          
          # Task
          Create a strategic partnership proposal email that would actually receive a response from ${receiver_name}.
          
          # Context
          - You're writing to ${receiver_name}, who works as ${receiver_job}.
          - About the recipient: ${receiver_summary}
          - Their latest LinkedIn post: "${latest_linkedin_post}"
          
          # Partnership Email Information
          ${company}
          
          ${partner}
          
          ${campaign}
          
          ${tone}
          
          # Email Writing Rules
          1. Begin by referencing a specific point from their LATEST LINKEDIN POST and connecting it to your partnership idea
          2. Reference 1-2 specific details from their background that align with your partnership vision
          3. Articulate the mutual value proposition clearly - what's in it for BOTH companies
          4. Provide a specific example of how the partnership would work in practice
          5. Include a brief success metric or case study from a similar partnership
          6. Keep the email between 170-200 words - detailed enough while remaining focused
          7. Propose a concrete next step with a specific timeframe
          8. Structure your email with short paragraphs and bullet points for scanability
          9. At least 60% of the content should focus on their business objectives or initiatives
          10. Include one unexpected insight or idea that connects their LinkedIn content with your partnership proposal
          11. Demonstrate you've studied their content by tying the partnership to their specific interests or expertise
          
          # Critical
          - Return ONLY the email body - no subject line or explanations
          - This email MUST present a clear, compelling case for why this partnership makes strategic sense
          - Focus on mutual benefits, not just what you want from them
          - Reference their LinkedIn post in a way that shows you understand their thinking
          - Write this email as if a major business opportunity depends on getting a response
        `;
      }
      else if (campaign_type === 'investor') {
        // Extract structured data from extracted_info
        const { company, traction, campaign, differentiation, tone } = extracted_info;

        mailPrompt = `
          # Role
          You are an elite fundraising strategist who has helped startups raise over $500M with a 60% investor response rate.
          
          # Task
          Create a compelling investor outreach email that would actually receive a response from ${receiver_name}.
          
          # Context
          - You're writing to ${receiver_name}, who works as ${receiver_job}.
          - About the recipient: ${receiver_summary}
          - Their latest LinkedIn post: "${latest_linkedin_post}"
          
          # Investor Email Information
          ${company}
          
          ${traction}
          
          ${campaign}
          
          ${differentiation}
          
          ${tone}
          
          # Email Writing Rules
          1. Open by referencing their LATEST LINKEDIN POST and connecting it to your startup's vision or market
          2. Reference 1-2 specific investments or focus areas from their background that align with your startup
          3. Include 2-3 concrete traction points that prove market validation (revenue, users, growth)
          4. Demonstrate why your team is uniquely positioned to win in this market
          5. Explain specifically why this investor is the right fit based on their investment thesis
          6. Keep the email between 170-200 words - concise but complete
          7. Include one forward-looking statement that shows ambition and scale
          8. Make your specific ask crystal clear (meeting, deck review, intro call)
          9. At least 50% of the email should demonstrate your understanding of their investment thesis or interests
          10. Use data-driven language with specific numbers, not general claims
          11. Create a sense of momentum and opportunity without false urgency
          
          # Critical
          - Return ONLY the email body - no subject line or explanations
          - This email MUST convey both traction and vision clearly and concisely
          - Reference their LinkedIn post in a way that feels genuine, not forced
          - Write this email as if your fundraising success depends on getting a response
        `;
      } else {
        return res.status(400).json({ error: "Invalid campaign type" });
      }

      // Generate the email body using an LLM
      const email = await client.chat.completions.create({
        messages: [
          { role: "system", content: mailPrompt }
        ],
        model: "gpt-4o",
        temperature: 0.7, // Add some creativity while maintaining quality
        max_tokens: 800  // Increased to accommodate slightly longer emails
      });

      // Return the generated email body
      res.status(200).json({
        email_body: email.choices[0].message.content
      });

    } catch (error) {
      console.error("Error generating email:", error);
      res.status(500).json({ error: "Failed to generate email", details: error.message });
    }
  });
});

exports.subejctGen = onRequest(async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "Missing name parameter" });
  }

  console.log("Email subject generation started");

  const prompt = `
###Role
You are an email marketing expert specializing in engaging subject lines.

###Task
Create a short, engaging subject line that grabs attention and increases open rates.
Use the recipient's name (${name}) to make it personal.

Sample subject lines:
- Regarding your latest LinkedIn post - had to share this with you, ${name}
- ${name}, your latest LinkedIn post made me think of this
- ${name}, I saw what you wrote on LinkedIn and want to follow up

###Note
- Keep it concise and engaging.
- Avoid "Subject:" at the beginning.
- Avoid quotation marks.
`;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });
    res.json({ subject: response.choices[0].message.content });
  } catch (error) {
    console.error("Error in API call:", error);
    res.status(500).json({ error: "Failed to generate email subject" });
  }
});


exports.convertHtml = onRequest(async (req, res) => {
  const { email_body } = req.body;
  if (!email_body) {
    return res.status(400).json({ error: "Missing email_body parameter" });
  }

  console.log("Email HTML conversion started");

  const prompt = ` 
      Here is the mail body: ${email_body}
      Your task is to:
      Add line breaks where appropriate using <br>.
      Replace any instance of **text** with <b>text</b>.
      Ensure the final output preserves structure and formatting for improved readability in HTML.
      Do not add any pretext or post text.
      Do not enclose the answer in quotes.
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o",
    });
    res.json({ html_body: response.choices[0].message.content });
  } catch (error) {
    console.error("Error in API call:", error);
    res.status(500).json({ error: "Failed to convert email body to HTML" });
  }
});


// exports.generateMailbody = onRequest(async (req, res) => {
//   const { firstPost, name, job, summary, sender_name, sender_details } = req.body;
//   if (!firstPost || !name || !job || !sender_name || !sender_details) {
//     return res.status(400).json({ error: "Missing required parameters" });
//   }

//   console.log("Email body generation started");

//   const email_prompt = `
//   ###Role
//   You are writing as ${sender_name}, ${sender_details} contacting ${name},
//   who holds the position ${job.title} at ${job.company} with a summary: ${summary}.

//   #Task
//   Create a short, personal outreach email that:
//   Maintains a conversational, professional, and approachable tone.
//   Starts with a friendly comment about the recipient's work or company.
//   Refer to their latest LinkedIn post ${firstPost} with a positive comment.
//   End with a warm, open invitation to connect and ask for a short response.

//   ###Sample Email
//   Hi Jenny,
//   I have to say that I am very impressed with the work you do at SMS Smart Media Solutions...

//   Kind regards,
//   ${sender_name}
//   ${sender_details}

//   ###Notes
//   Do not include a subject line in the final result.
//   Keep the tone warm and non-salesy.
//   Avoid specific statistics or percentages.
//   Focus on connection and shared interests.
//   `;

//   try {
//     const response = await client.chat.completions.create({
//       messages: [{ role: "user", content: email_prompt }],
//       model: "gpt-4",
//     });
//     res.json({ email_body: response.choices[0].message.content });
//   } catch (error) {
//     console.error("Error in API call:", error);
//     res.status(500).json({ error: "Failed to generate email body" });
//   }
// });



exports.unipileWebhook = onRequest(
  {
    region: "us-central1", // or your desired region
  },
  async (req, res) => {
    cors(req, res, async () => {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const data = req.body;

      if (data.status === 'CREATION_SUCCESS') {
        const acc_id = data.account_id;
        const user_id = data.name;

        try {
          // Call retrieve profile API
          const client = new UnipileClient(BASE_URL, ACCESS_TOKEN);
          const profile = await client.users.getOwnProfile(acc_id);

          await db.collection("linkedin_acc").add({
            account_id: acc_id,
            created_by: user_id,
            created_at: new Date(),
            name: `${profile.first_name} ${profile.last_name}`,
            username: profile.public_identifier,
            provider_id: profile.provider_id,
            occupation: profile.occupation,
            profile_picture_url: profile.profile_picture_url,
            email: profile.email,
            location: profile.location,
            premium: profile.premium,
            open_profile: profile.open_profile,
            object_urn: profile.object_urn,
            entity_urn: profile.entity_urn,
            provider: profile.provider,
          });

          res.status(200).send("Received and stored");
        } catch (error) {
          console.error("Error retrieving profile or saving to DB:", error);
          res.status(500).send("Internal Server Error");
        }
      } else {
        res.status(200).send("Ignored: Status not CREATION_SUCCESS");
      }
    });
  }
);


exports.createUnipileAuthLink = onRequest(

  async (req, res) => {

    cors(req, res, async () => {

      try {
        const userId = req.body.userId || req.query.userId;
        if (!userId) {
          return res.status(400).json({ error: "Missing userId in request" });
        }

        const type = "create";
        const providers = ["LINKEDIN"];
        const api_url = BASE_URL;
        const expiresOn = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
        const success_redirect_url = "https://developer.unipile.com/reference/userscontroller_getprofilebyidentifier";
        const failure_redirect_url = "https://developer.unipile.com/reference/userscontroller_getprofilebyidentifier";
        const notify_url = "https://us-central1-mailex-cfa6e.cloudfunctions.net/unipileWebhook";
        const name = userId;

        const client = new UnipileClient(BASE_URL, ACCESS_TOKEN);
        const response = await client.account.createHostedAuthLink({
          type,
          providers,
          api_url,
          expiresOn,
          success_redirect_url,
          failure_redirect_url,
          notify_url,
          name,
        });

        res.status(200).json({
          message: "Auth Link Created",
          data: response,
        });
      } catch (error) {
        console.error("Error creating auth link:", error?.response?.data || error);
        res.status(500).json({
          error: "Internal Server Error",
          details: error?.response?.data || error.message,
        });



      }







    });

  }
);

exports.createcampaign = onRequest(
  async (req, res) => {
  cors(req,res,async()=>{
    try {
      if (req.method !== "POST") {
        return res.status(400).send("Only POST requests are allowed.");
      }
      console.log(req.body)
      const { campaignName, mailboxes, leadIds, userId, extracted_info, summary, campaign_type, islinkedin, linkedinAccounts } = req.body;
      if (!campaignName || !mailboxes || !leadIds || !userId) {
        return res.status(400).send("Missing required fields.");
      }
  
      // Format mailboxes
      // const formattedMailboxes = mailboxes.map((mailbox, ind) => ({
      //   mailbox_id: "mail_box" + ind,
      //   mailbox_address: mailbox.sender_email,
      //   mailbox_password: mailbox.password,
      // }));

      const formattedMailboxes = mailboxes.map((mailbox, ind) => ({
        mailbox_id: "mail_box" + ind,
        mailbox_details:mailbox.details
      }));
  
  
      // Format LinkedIn accounts if they exist
      const formattedLinkedin = linkedinAccounts ? linkedinAccounts.map((acc, ind) => ({
        account_id: acc.account_id,
        account_name: acc.name
      })) : [];
  
      // Fetch Leads from Firestore
      let leads = [];
  
      for (const id of leadIds) {
        try {
          const docRef = db.collection("marketings").doc(id);
          const docSnap = await docRef.get();
  
          if (docSnap.exists) {
            const data = docSnap.data();
  
            console.log("Fetched data:", JSON.stringify(data, null, 2)); // Debugging
  
            if (!Array.isArray(data.leads)) {
              console.error("Error: leads is not an array", data.leads);
              continue;  // Skip this document instead of returning
            }
  
            // Create a new leads array with additional fields
            const updatedLeads = data.leads.map(lead => ({
              ...lead,
              generated_mail_body: "",
              generated_mail_subject: ""
            }));
  
            console.log("Updated leads data:", JSON.stringify(updatedLeads, null, 2));
  
            // Push objects directly into the `leads` array (flattening it)
            leads.push(...updatedLeads);
          }
        } catch (error) {
          console.error("Error fetching lead:", error);
        }
      }
  
      console.log("Final Leads Array:", leads); // Check the final structure
  
      const batchSize = 50;
      const totalBatches = Math.ceil(leads.length / batchSize);
      let batches = [];
      let generateQueue = {};
      let sendQueue = {};
  
      for (let i = 0; i < totalBatches; i++) {
        const mailboxIndex = i % formattedMailboxes.length;
        const assignedMailboxId = formattedMailboxes[mailboxIndex].mailbox_id;
  
        let assignedLinkedinAcc = null;
  
        if (islinkedin && formattedLinkedin.length > 0) {
          const linkedin_ind = i % formattedLinkedin.length;
          assignedLinkedinAcc = formattedLinkedin[linkedin_ind];
        }
  
        const batch = {
          batch_id: "batch" + i,
          assigned_mailbox_id: assignedMailboxId,
          leads: leads.slice(i * batchSize, (i + 1) * batchSize),
          islinkedin: islinkedin,
          assignedLinkedinAcc: assignedLinkedinAcc || null
        };
  
        batches.push(batch);
  
        // Organize generateQueue by mailbox_id
        if (!generateQueue[assignedMailboxId]) {
          generateQueue[assignedMailboxId] = [];
        }
        generateQueue[assignedMailboxId].push(batch);
      }
  
      // Store the campaign in Firestore
      const campaignRef = await db.collection("campaigns").add({
        campaignName,
        mailBoxes: formattedMailboxes,
        sendQueue: {},
        generateQueue,
        sentBatches: {},
        countBatches: batches.length,
        userId,
        summary,
        extracted_info,
        campaign_type,
        islinkedin: islinkedin,
        linkedinAccounts: formattedLinkedin
      });
  
      return res.status(200).json({
        success: true,
        campaignId: campaignRef.id,
        message: "Campaign created successfully",
      });
  
    } catch (error) {
      console.error("Error creating campaign:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }


  });
  
});

exports.generateWeeklyEmails = onSchedule("every Saturday 00:00", async () => {
  const queue = getFunctions(getApp(), {
    serviceAccountId: "firebase-adminsdk-h3a3t@mailex-cfa6e.iam.gserviceaccount.com",
    region: "us-central1"
  }).taskQueue("processsEmailGeneration"); // Fixed typo in queue name

  const campaigns = await db.collection("campaigns").get();

  for (const campaignDoc of campaigns.docs) {
    const campaignId = campaignDoc.id;
    const campaign = campaignDoc.data();
    const { generateQueue, mailBoxes, extracted_info, campaign_type, linkedinAccounts } = campaign;

    if (!mailBoxes || mailBoxes.length === 0) continue;

    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + ((1 + 7 - currentDate.getDay()) % 7)); // Move to next Monday

    for (let i = 0; i < mailBoxes.length; i++) {
      const mailboxname = `mail_box${i}`;
      if (!generateQueue[mailboxname] || generateQueue[mailboxname].length === 0) continue;

      console.log("Processing mailbox:", mailboxname);
      const batches = generateQueue[mailboxname].slice(0, 5);
      generateQueue[mailboxname] = generateQueue[mailboxname].slice(batches.length);

      for (const batch of batches) {
        console.log("Processing batch:", batch.batch_id);
        const batchDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);

        // Create a separate date for LinkedIn messages
        const linkedinDate = new Date(currentDate);
        linkedinDate.setDate(linkedinDate.getDate() + 2);// ✅ Task function to process sending emails

// exports.processEmailsending = onTaskDispatched(
//           {
//             retryConfig: { maxRetries: 3 },
//             rateLimits: { maxConcurrentDispatches: 6 },
//           },
//           async (task) => {
//             try {
//               // ✅ Extract task data
//               const { body, subject, email,  batch_id, campaign_id, islinkedin, account_id, provider_id, linkedin_message } = task.data;
//               let linkedinSent = false;

//               // Handle LinkedIn message sending if applicable
//               if (islinkedin && account_id && provider_id) {
//                 try {
//                   // Import required modules at the top of the file
//                   const client = new UnipileClient(BASE_URL, ACCESS_TOKEN);

//                   const linkedinResponse = await client.users.sendInvitation({
//                     account_id,
//                     provider_id,
//                     message: linkedin_message || body
//                   });

//                   console.log(`✅ LinkedIn message sent to provider_id: ${provider_id}`);
//                   linkedinSent = true;

//                   // Update Firestore with LinkedIn message status
//                   const campaignRef = db.collection("campaigns").doc(campaign_id);
//                   const campaignSnapshot = await campaignRef.get();

//                   if (!campaignSnapshot.exists) {
//                     console.error(`❌ Campaign not found: ${campaign_id}`);
//                     return;
//                   }

//                   let sentBatches = campaignSnapshot.data().sentBatches || {};

//                   if (!sentBatches[batch_id]) {
//                     sentBatches[batch_id] = { send_date: new Date().toISOString(), leads: [] };
//                   }

//                   sentBatches[batch_id].leads.push({
//                     linkedin_message: linkedin_message || body,
//                     account_id,
//                     provider_id,
//                     subject,
//                     receiver_email: email,
//                     time: new Date().toISOString(),
//                     platform: "linkedin"
//                   });

//                   await campaignRef.update({ sentBatches });
//                   console.log(`✅ LinkedIn message stored in batch ${batch_id} for ${email}`);

//                   // Removed the return statement here to continue with email sending
//                 } catch (linkedinError) {
//                   console.error("❌ Error sending LinkedIn message:", linkedinError);
//                   // Continue to try email if LinkedIn fails
//                 }
//               }

//               // Send email (always sent if islinkedin is false, or sent in addition to LinkedIn if islinkedin is true)
//               const data = {
//                 email: body,
//                 details:ma
//                 subject: subject,
              
//                 receiver_email: email,
//               };

//               const url = "https://us-central1-mailex-cfa6e.cloudfunctions.net/sendMail";
//               const response = await axios.post(url, data);

//               if (response.data.status === 200) {
//                 const campaignRef = db.collection("campaigns").doc(campaign_id);
//                 const campaignSnapshot = await campaignRef.get();

//                 if (!campaignSnapshot.exists) {
//                   console.error(`❌ Campaign not found: ${campaign_id}`);
//                   return;
//                 }

//                 let sentBatches = campaignSnapshot.data().sentBatches || {};

//                 if (!sentBatches[batch_id]) {
//                   sentBatches[batch_id] = { send_date: new Date().toISOString(), leads: [] };
//                 }

//                 sentBatches[batch_id].leads.push({
//                   email: body,
//                   user_email: sender_email,
//                   subject,
//                   appPassword,
//                   receiver_email: email,
//                   time: new Date().toISOString(),
//                   platform: "email"
//                 });

//                 await campaignRef.update({ sentBatches });
//                 console.log(`✅ Email stored in batch ${batch_id} for ${email}`);
//               } else {
//                 console.error("❌ Error sending email");
//               }

//               // Log summary of what was sent
//               if (linkedinSent) {
//                 console.log(`✅ Both LinkedIn message and email sent for ${email}`);
//               } else {
//                 console.log(`✅ Email sent for ${email}`);
//               }

//             } catch (error) {
//               console.error("❌ Error processing email sending task:", error);
//               throw new Error("Email sending failed: " + error.message);
//             }
//           }
//         );

        exports.schedulesendEmail = onSchedule("every Saturday 00:00", async () => {
          const queue = getFunctions(getApp(), {
            serviceAccountId: "firebase-adminsdk-h3a3t@mailex-cfa6e.iam.gserviceaccount.com",
            region: "us-central1",
          }).taskQueue("processEmailsending");

          const campaigns = await db.collection("campaigns").get();

          for (const campaignDoc of campaigns.docs) {
            const campaignId = campaignDoc.id;
            const campaign = campaignDoc.data();
            let { sendQueue, mailBoxes, linkedinAccounts } = campaign;

            // ✅ Ensure sendQueue is an object
            if (!sendQueue || typeof sendQueue !== "object") {
              sendQueue = {};
            }

            let updatedSendQueue = { ...sendQueue }; // Clone sendQueue for safe modifications

            for (const batchId in sendQueue) {
              const batch = sendQueue[batchId];
              const today = new Date().toISOString().split("T")[0];

              // ✅ Ensure batch.send_date is correctly formatted
              const batchDate =
                typeof batch.send_date === "string"
                  ? batch.send_date // Already a string, use directly
                  : batch.send_date instanceof Date
                    ? batch.send_date.toISOString().split("T")[0]
                    : batch.send_date?.toDate instanceof Function
                      ? batch.send_date.toDate().toISOString().split("T")[0]
                      : null; // If it's not valid, set to null

              console.log(`Batch ${batchId} date: ${batchDate}, Today: ${today}`);

              if (batchDate === today) {
                console.log(`Processing batch ${batchId} for today's date`);

                for (const info of batch.leads) {
                  try {
                    // Check if this is a LinkedIn message or regular email
                    const isLinkedinMessage = info.islinkedin === true || info.islinkedin === 1;

                    // // ✅ Correct mailbox lookup
                    // let sender_email = "";
                    // let pass = "";

                    let details={};

                    for (let i = 0; i < mailBoxes.length; i++) {
                      if (mailBoxes[i].mailbox_id === info.mailbox_id) {
                        // sender_email = mailBoxes[i].mailbox_address;
                        // pass = mailBoxes[i].mailbox_password;
                        details=mailBoxes[i].details;
                      }
                    }

                    // if (!sender_email || !pass) {
                    //   console.error(`❌ Mailbox not found for ID: ${info.mailbox_id}`);
                    //   continue;
                    // }

                    const { body, subject, lead } = info;
                    const email = lead.email;

                    if (isLinkedinMessage) {
                      // Handle LinkedIn message
                      const linkedinAccount = info.account_id ?
                        (linkedinAccounts || []).find(acc => acc.account_id === info.account_id) : null;

                      if (!linkedinAccount && info.account_id) {
                        console.error(`❌ LinkedIn account not found for ID: ${info.account_id}`);
                      }

                      await queue.enqueue(
                        {
                          body: info.body,
                          linkedin_message: info.linkedin_message,
                          subject: info.subject,
                          email: email,
                          mailbox_details,
                          batch_id: batchId,
                          campaign_id: campaignId,
                          islinkedin: true,
                          account_id: info.account_id,
                          provider_id: info.provider_id
                        },
                        {
                          oidcToken: {
                            serviceAccountEmail: "mailex-cfa6e@appspot.gserviceaccount.com",
                          },
                        }
                      );

                      console.log(`✅ LinkedIn + Email task enqueued for ${email}`);
                    } else {
                      // Handle regular email only
                      await queue.enqueue(
                        {
                          body,
                          subject,
                          email,
                         mailbox_details,
                          batch_id: batchId,
                          campaign_id: campaignId,
                          islinkedin: false
                        },
                        {
                          oidcToken: {
                            serviceAccountEmail: "mailex-cfa6e@appspot.gserviceaccount.com",
                          },
                        }
                      );

                      console.log(`✅ Email task enqueued for ${email}`);
                    }
                  } catch (error) {
                    console.error(`❌ Error enqueueing task for ${info.lead?.email || 'unknown'}:`, error.message);
                  }
                }

                // ✅ Remove processed batch from sendQueue
                delete updatedSendQueue[batchId];
                console.log(`✅ Batch ${batchId} processed and removed from queue`);
              }
            }

            // ✅ Update Firestore with the modified sendQueue
            await db.collection("campaigns").doc(campaignId).update({ sendQueue: updatedSendQueue });
            console.log(`✅ Campaign ${campaignId} updated with new sendQueue`);
          }
        });

        for (const lead of batch.leads) {
          try {
            const isLinkedinBatch = batch.islinkedin === true || batch.islinkedin === 1;
            await queue.enqueue(
              {
                mailbox_id: mailboxname,
                batch_id: batch.batch_id || "unknown_batch",
                lead,
                campaign_id: campaignId,
                send_date: batchDate.toISOString().substring(0, 10),
                send_date_linkedin: isLinkedinBatch ? linkedinDate.toISOString().substring(0, 10) : null,
                islinkedin: isLinkedinBatch,
                account_id: isLinkedinBatch && batch.assignedLinkedinAcc ? batch.assignedLinkedinAcc.account_id : "",
                extracted_info,
                campaign_type
              },
              {
                // Add authentication for Cloud Tasks
                oidcToken: {
                  serviceAccountEmail: "mailex-cfa6e@appspot.gserviceaccount.com",
                },
              }
            );

          } catch (error) {
            console.error(`❌ Failed to enqueue task for ${lead.email}:`, error.message);
          }
        }
      }
    }

    await campaignDoc.ref.update({ generateQueue });
    console.log(`✅ Emails enqueued for campaign: ${campaign.campaignName}`);
  }
});



exports.processsEmailGeneration = onTaskDispatched(
  {
    retryConfig: { maxRetries: 3 },
    rateLimits: { maxConcurrentDispatches: 6 },
  },
  async (task) => {
    console.log("📩 Incoming task data:", JSON.stringify(task, null, 2));

    if (!task || !task.data) {
      console.error("❌ Request body is missing data.");
      throw new Error("Invalid request, missing data.");
    }

    const { mailbox_id, lead, batch_id, campaign_id, send_date, extracted_info, campaign_type, islinkedin, account_id } = task.data;

    if (!mailbox_id || !lead || !lead.email || !batch_id || !campaign_id || !send_date || !extracted_info) {
      console.error("❌ Missing required fields:", JSON.stringify(task.data, null, 2));
      throw new Error("Invalid request, missing required fields.");
    }

    try {
      console.log(`📌 Processing email for ${lead.email} (Campaign: ${campaign_id})`);

      const data = {
        linkedinURL: lead.linkedin_url || "",
        sender_name: "John Cron",
        sender_details: "CEO at Mailex, expertise in digital marketing",
        extracted_info,
        campaign_type,
        islinkedin,
        account_id: islinkedin ? account_id : ""
      };

      let generatedEmail = null;
      let subject = null;
      let provider_id = "";

      try {
        const response = await axios.post(
          "https://us-central1-mailex-cfa6e.cloudfunctions.net/generateMail",
          data
        );
        generatedEmail = response.data.body;
        subject = response.data.subject;
        provider_id = response.data.provider_id || "";
        console.log(`✅ Email generated for ${lead.email}`);
      } catch (error) {
        console.error(`❌ Error generating mail for ${lead.email}:`, error.response?.data || error.message);
        throw new Error("Email generation failed");
      }

      // Get campaign reference
      const campaignRef = db.collection("campaigns").doc(campaign_id);
      const campaignSnapshot = await campaignRef.get();

      if (!campaignSnapshot.exists) {
        console.error(`❌ Campaign not found: ${campaign_id}`);
        return;
      }

      let sendQueue = campaignSnapshot.data().sendQueue || {};
      if (!sendQueue[batch_id]) {
        sendQueue[batch_id] = { send_date, leads: [] };
      }

      let linkedin_message = "";

      if (islinkedin) {
        // Import required modules at the top of the file

        const prompt = `**Role:**  
You are a helpful assistant that crafts professional and concise LinkedIn connection requests. You specialize in understanding the context of a given email and converting it into a brief, engaging message suitable for LinkedIn.

**Task:**  
Given the body of an email, extract the key context and generate a personalized LinkedIn connection request message that is relevant, friendly, and under 300 characters in length.

**Critics:**  
- The message must not exceed 300 characters.  
- Avoid generic messages; use details from the email to personalize the note.  
- Maintain a professional yet approachable tone suitable for LinkedIn.  
- Avoid copying large parts of the email verbatim—summarize effectively.
`


        try {
          const completion = await client.chat.completions.create({
            messages: [
              { role: "system", content: prompt },
              { role: "user", content: generatedEmail }
            ],
            model: "gpt-4",
            temperature: 0.7, // Add some creativity while maintaining quality
            max_tokens: 800  // Increased to accommodate slightly longer emails
          });




          linkedin_message = completion.choices[0].message.content;
          console.log("LinkedIn message generated:", linkedin_message);
        } catch (openaiError) {
          console.error("OpenAI API error:", openaiError);
          linkedin_message = "Failed to generate LinkedIn message";
        }
      }

      // Store in sendQueue regardless of LinkedIn or email
      sendQueue[batch_id].leads.push({
        batch_id: batch_id,
        mailbox_id,
        lead,
        subject,
        body: generatedEmail,
        linkedin_message: linkedin_message,
        islinkedin: !!islinkedin,
        account_id: islinkedin ? account_id : "",
        provider_id: provider_id
      });

      const resp = await campaignRef.update({ sendQueue });
      console.log(resp)
      console.log(`✅ Email/Message stored in batch ${batch_id} for ${lead.email}`);

    } catch (error) {
      console.error("❌ Error processing task:", error.message);
      throw new Error("Task processing failed");
    }
  }
);

exports.generateMail = onRequest(async (req, res) => {
  try {
    const { linkedinURL, extracted_info, campaign_type, account_id, islinkedin } = req.body;

    const linkedinData = await axios.get("https://us-central1-mailex-cfa6e.cloudfunctions.net/getLinkedinData", {
      params: { url: linkedinURL },
    });
    console.log(linkedinData.data);
    const username = linkedinData.data.username;
    const firstPost = await axios.get("https://us-central1-mailex-cfa6e.cloudfunctions.net/getFirstPost", {
      params: { username: linkedinData.data.username },
    });
    console.log(firstPost.data);

    const mailBodyResponse = await axios.post("https://us-central1-mailex-cfa6e.cloudfunctions.net/generateMailbody", {
      firstPost: firstPost.data,
      name: linkedinData.data.name,
      job: linkedinData.data.position,
      summary: linkedinData.data.summary,
      extracted_info,
      campaign_type
    });
    console.log(mailBodyResponse.data.email_body);

    const subjectResponse = await axios.get("https://us-central1-mailex-cfa6e.cloudfunctions.net/subejctGen", {
      params: { name: linkedinData.data.name },
    });
    console.log(subjectResponse.data.subject);

    const htmlBodyResponse = await axios.post("https://us-central1-mailex-cfa6e.cloudfunctions.net/convertHtml", {
      email_body: mailBodyResponse.data.email_body,
    });
    console.log(htmlBodyResponse.data.html_body);

    let provider_id = "";

    if (islinkedin === true && account_id) {
      // Import required modules at the top of the file



      try {
        const client = new UnipileClient(BASE_URL, ACCESS_TOKEN);
        const linkedin_response = await client.users.getProfile({
          account_id,
          // Use a proper identifier from the lead or request
          identifier: username || linkedinData.data.username,
          notify: true
        });
        console.log(linkedin_response)
        provider_id = linkedin_response.provider_id || "";

      } catch (linkedinError) {
        console.error("LinkedIn API error:", linkedinError);
      }
    }

    res.json({
      body: htmlBodyResponse.data.html_body,
      subject: subjectResponse.data.subject,
      provider_id: provider_id
    });

  } catch (error) {
    console.error("Error in generating email:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Task function to process sending emails
exports.processEmailsending = onTaskDispatched(
  {
    retryConfig: { maxRetries: 3 },
    rateLimits: { maxConcurrentDispatches: 6 },
  },
  async (task) => {
    try {
      // ✅ Extract task data
      const { body, subject, email, mailbox_details, batch_id, campaign_id, islinkedin, account_id, provider_id, linkedin_message } = task.data;
      let linkedinSent = false;

      // Handle LinkedIn message sending if applicable
      if (islinkedin && account_id && provider_id) {
        try {
          // Import required modules at the top of the file
          const client = new UnipileClient(BASE_URL, ACCESS_TOKEN);

          const linkedinResponse = await client.users.sendInvitation({
            account_id,
            provider_id,
            message: linkedin_message || body
          });

          console.log(`✅ LinkedIn message sent to provider_id: ${provider_id}`);
          linkedinSent = true;

          // Update Firestore with LinkedIn message status
          const campaignRef = db.collection("campaigns").doc(campaign_id);
          const campaignSnapshot = await campaignRef.get();

          if (!campaignSnapshot.exists) {
            console.error(`❌ Campaign not found: ${campaign_id}`);
            return;
          }

          let sentBatches = campaignSnapshot.data().sentBatches || {};

          if (!sentBatches[batch_id]) {
            sentBatches[batch_id] = { send_date: new Date().toISOString(), leads: [] };
          }

          sentBatches[batch_id].leads.push({
            linkedin_message: linkedin_message || body,
            account_id,
            provider_id,
            subject,
            receiver_email: email,
            time: new Date().toISOString(),
            platform: "linkedin"
          });

          await campaignRef.update({ sentBatches });
          console.log(`✅ LinkedIn message stored in batch ${batch_id} for ${email}`);

          // Removed the return statement here to continue with email sending
        } catch (linkedinError) {
          console.error("❌ Error sending LinkedIn message:", linkedinError);
          // Continue to try email if LinkedIn fails
        }
      }

      // Send email (always sent if islinkedin is false, or sent in addition to LinkedIn if islinkedin is true)
      const data = {
        email: body,
        
        subject: subject,
        details:mailbox_details,
        receiver_email: email,
      };

      const url = "https://us-central1-mailex-cfa6e.cloudfunctions.net/sendMail";
      const response = await axios.post(url, data);

      if (response.data.status === 200) {
        const campaignRef = db.collection("campaigns").doc(campaign_id);
        const campaignSnapshot = await campaignRef.get();

        if (!campaignSnapshot.exists) {
          console.error(`❌ Campaign not found: ${campaign_id}`);
          return;
        }

        let sentBatches = campaignSnapshot.data().sentBatches || {};

        if (!sentBatches[batch_id]) {
          sentBatches[batch_id] = { send_date: new Date().toISOString(), leads: [] };
        }

        sentBatches[batch_id].leads.push({
          email: body,
          user_email: mailbox_details.user_email,
          subject,
          receiver_email: email,
          time: new Date().toISOString(),
          platform: "email"
        });

        await campaignRef.update({ sentBatches });
        console.log(`✅ Email stored in batch ${batch_id} for ${email}`);
      } else {
        console.error("❌ Error sending email");
      }

      // Log summary of what was sent
      if (linkedinSent) {
        console.log(`✅ Both LinkedIn message and email sent for ${email}`);
      } else {
        console.log(`✅ Email sent for ${email}`);
      }

    } catch (error) {
      console.error("❌ Error processing email sending task:", error);
      throw new Error("Email sending failed: " + error.message);
    }
  }
);

exports.schedulesendEmail = onSchedule("every Saturday 00:00", async () => {
  const queue = getFunctions(getApp(), {
    serviceAccountId: "firebase-adminsdk-h3a3t@mailex-cfa6e.iam.gserviceaccount.com",
    region: "us-central1",
  }).taskQueue("processEmailsending");

  const campaigns = await db.collection("campaigns").get();

  for (const campaignDoc of campaigns.docs) {
    const campaignId = campaignDoc.id;
    const campaign = campaignDoc.data();
    let { sendQueue, mailBoxes, linkedinAccounts } = campaign;

    // ✅ Ensure sendQueue is an object
    if (!sendQueue || typeof sendQueue !== "object") {
      sendQueue = {};
    }

    let updatedSendQueue = { ...sendQueue }; // Clone sendQueue for safe modifications

    for (const batchId in sendQueue) {
      const batch = sendQueue[batchId];
      const today = new Date().toISOString().split("T")[0];

      // ✅ Ensure batch.send_date is correctly formatted
      const batchDate =
        typeof batch.send_date === "string"
          ? batch.send_date // Already a string, use directly
          : batch.send_date instanceof Date
            ? batch.send_date.toISOString().split("T")[0]
            : batch.send_date?.toDate instanceof Function
              ? batch.send_date.toDate().toISOString().split("T")[0]
              : null; // If it's not valid, set to null

      console.log(`Batch ${batchId} date: ${batchDate}, Today: ${today}`);

      if (batchDate === today) {
        console.log(`Processing batch ${batchId} for today's date`);

        for (const info of batch.leads) {
          try {
            // Check if this is a LinkedIn message or regular email
            const isLinkedinMessage = info.islinkedin === true || info.islinkedin === 1;

            // ✅ Correct mailbox lookup
            let details={};

            for (let i = 0; i < mailBoxes.length; i++) {
              if (mailBoxes[i].mailbox_id === info.mailbox_id) {
              
                details = mailBoxes[i].details;
              }
            }

           

            const { body, subject, lead } = info;
            const email = lead.email;

            if (isLinkedinMessage) {
              // Handle LinkedIn message
              const linkedinAccount = info.account_id ?
                (linkedinAccounts || []).find(acc => acc.account_id === info.account_id) : null;

              if (!linkedinAccount && info.account_id) {
                console.error(`❌ LinkedIn account not found for ID: ${info.account_id}`);
              }

              await queue.enqueue(
                {
                  body: info.body,
                  linkedin_message: info.linkedin_message,
                  subject: info.subject,
                  email: email,
                  mailbox_details:details,
                  batch_id: batchId,
                  campaign_id: campaignId,
                  islinkedin: true,
                  account_id: info.account_id,
                  provider_id: info.provider_id
                },
                {
                  oidcToken: {
                    serviceAccountEmail: "mailex-cfa6e@appspot.gserviceaccount.com",
                  },
                }
              );

              console.log(`✅ LinkedIn + Email task enqueued for ${email}`);
            } else {
              // Handle regular email only
              await queue.enqueue(
                {
                  body,
                  subject,
                  email,
                  mailbox_details:details,
                  batch_id: batchId,
                  campaign_id: campaignId,
                  islinkedin: false
                },
                {
                  oidcToken: {
                    serviceAccountEmail: "mailex-cfa6e@appspot.gserviceaccount.com",
                  },
                }
              );

              console.log(`✅ Email task enqueued for ${email}`);
            }
          } catch (error) {
            console.error(`❌ Error enqueueing task for ${info.lead?.email || 'unknown'}:`, error.message);
          }
        }

        // ✅ Remove processed batch from sendQueue
        delete updatedSendQueue[batchId];
        console.log(`✅ Batch ${batchId} processed and removed from queue`);
      }
    }

    // ✅ Update Firestore with the modified sendQueue
    await db.collection("campaigns").doc(campaignId).update({ sendQueue: updatedSendQueue });
    console.log(`✅ Campaign ${campaignId} updated with new sendQueue`);
  }
});


// exports.sendMail = onRequest(async (req, res) => {
//   const { email, subject, receiver_email,details } = req.body;

 
//   const transporter = nodemailer.createTransport({
//     host: details.domain,
//     port: details.port,
//     secure: details.secured,
//     auth: {
//       user: details.user_email,
//       pass: details.appPassword,
//     },
//   });
//   const mailOptions = {
//     from: details.user_email,
//     to: receiver_email,
//     subject: subject,
//     html: email,

//   };
//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.log(error);
//     }
//     console.log('Message %s sent: %s', info.messageId, info.response);
//   });
//   res.json({
//     message: 'Email sent successfully',
//     status: 200,
//   });


// });
