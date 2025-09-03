const express = require("express"),
  path = require("path"),
  session = require("express-session"),
  app = express(),
  port = process.env.PORT || 3001;
  // https = require('https'),
  // fs = require('fs');

// SET VIEW ENGINE AND PATH //
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// END //

// SET ASSETS AS A STATIC PATH //
app.use(express.static(path.join(__dirname, "assets/")));
// app.use(express.static(path.join(__dirname, "assets/editor")));
// END //

// SET REQUEST HANDLER //
// app.use(express.json()); //
// app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: false,
    parameterLimit: 1000000,
  })
);
// END //

// CONFIGURE SESSION //
app.use(
  session({
    secret: "ESG RISK VIEWER",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000,
    },
  })
);
// END //

// const options = {
//   key: fs.readFileSync(path.join(__dirname, 'ssl/private-key.txt')),
//   cert: fs.readFileSync(path.join(__dirname, 'ssl/esgriskviewer.crt')),
//   /*ca: [
//       fs.readFileSync(path.join(__dirname, 'ssl_credential/DigiCertCA.crt')),
//       fs.readFileSync(path.join(__dirname, 'ssl_credential/My_CA_Bundle.crt'))
//   ]*/
// };

// var server = https.createServer(options, app);

// PRE REQUEST HANDLER //
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.active = req.path.split("/")[1];
  res.locals.curr_path = req.originalUrl
  res.locals.message = req.session.message;
  res.locals.query_params = Object.keys(req.query)
  res.locals.videoPopUp = req.session.videoPopUp ? (req.session.user ? (req.session.user.user_type != 'S' ? req.session.videoPopUp : false) : req.session.videoPopUp) : false
  delete req.session.message;
  delete req.session.videoPopUp;
  // console.log(res.locals.videoPopUp, req.path);
  // console.log(req.path);
  // if(req.path != '/' && req.path != '/login'){
  //   if(!req.session.user){
  //     res.redirect('/login')
  //   }
  // }
  next();
});
// END //

// IMPORT ROUTERS //
const { UserRouter } = require("./router/UserRouter");
const { DataCollectionRouter } = require("./router/DataCollectionRouter");
const { MasterRouter } = require("./router/MasterRouter");
const { SubsRouter } = require("./router/SubscriptionRouter");
const { ProjectRouter } = require("./router/ProjectsRouter");
const { DashboardRouter } = require("./router/DashboardRouter");
const { SupportRouter } = require("./router/SupportRouter");
const { imgGalaryRouter } = require("./router/imgGalaryRouter");
const { CalculatorRouter } = require("./router/CalculatorRouter");
const { FBRouter } = require("./router/formBuilderRouter");
const { CalcUserRouter } = require("./router/CalculatorUseRouter");
// END //

app.get("/", (req, res) => {
  // var bcrypt = require('bcrypt')
  // var pass = '123'
  // pass = bcrypt.hashSync(pass, 10)
  // res.send(pass)
  // function encodeString(str) {
  //   let numeric = '';
  //   for (let i = 0; i < str.length; i++) {
  //     numeric += str.charCodeAt(i).toString().padStart(3, '0');
  //   }
  //   return numeric;
  // }

  // function decodeString(numericStr) {
  //   let result = '';
  //   for (let i = 0; i < numericStr.length; i += 3) {
  //     const charCode = parseInt(numericStr.substring(i, i + 3));
  //     result += String.fromCharCode(charCode);
  //   }
  //   return result;
  // }
  // // Usage in URL
  // const language = JSON.stringify({
  //   sec_id: '1',
  //   ind_id: '1',
  //   top_id: 0,
  //   proj_id: '54',
  //   proj_name: 'Multiple test',
  //   repo_type: 'ifrs',
  //   flag: 'I',
  //   dec_flag: 'I'
  // });
  // const encoded = encodeString(language);
  // const url = `https://example.com/api?lang=${encoded}`;
  // console.log('URL:', url);

  // // To decode
  // const decoded = decodeString(encoded);
  // console.log('Decoded:', decoded);

  let user = req.session.user;
  if (user) {
    res.redirect("/dashboard");
  } else {
    // res.render('landing_page/landing')
    res.redirect("/login");
  }
});

app.get('/test_lala',async (req, res) => {
  // const {SendUserEmail} = require('./modules/EmailModule')
  const bcrypt = require('bcrypt')
  var pass = bcrypt.hashSync('8240378957', 10)
  // var dateFormat = require('dateformat')
  // var enc = Buffer.from('F').toString('base64')
  ////////////////////////////////
  // var enc = Buffer.from(JSON.stringify({email_id: 'subham@gmail.com', url_time: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')})).toString('base64')
  // console.log({email_id: 'subham@gmail.com', url_time: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')});
  // var email = await SendUserEmail('suvrajit@synergicsoftek.com', 'Suvrajit Banerjee', encodeURIComponent(enc))
  // console.log(email);
  /////////////////////////////////
  // dec = new Buffer.from(enc, 'base64').toString();
  // console.log(dec);
  // res.send(encodeURIComponent(enc))
  // console.log(req.files);
  // res.send('LALA')
  res.send(pass)
  // res.render('test')
})

app.get('/test_ai', async (req, res) => {
  const {db_Select} = require('./modules/MasterModule')
  var data = {
    "scope_id": "1",
    "lang_flag": "E",
    "sec_id": "2",
    "header": "Répondez aux questions suivantes: (2 au choix)",
    "hed_1": "",
    "q_1": "D'après l’image, nommez des soucis principaux de santé chezles jeunes.",
    "q_s_1": [
    "Yes",
    "No"
    ],
    "option_1": "radio",
    "cards": [
    "1",
    "2",
    "3"
    ],
    "s_1": "1",
    "p_c_1": "",
    "p_s_c_1": "",
    "hed_2": "",
    "q_2": "Que faut-il faire pour mener une vie saine?",
    "q_s_2": [
    "Yes",
    "No"
    ],
    "option_2": "radio",
    "s_2": "1",
    "p_c_2": "1",
    "p_s_c_2": "",
    "hed_3": "",
    "q_3": "Qu’est-ce qui va nous arriver si on ne mange pas assez ?",
    "option_3": "short_text",
    "s_3": "1",
    "p_c_3": "1",
    "p_s_c_3": "1"
  }

  var res_dt = await db_Select('id', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}' AND header_flag="Y" AND input_type IS NULL`, null)

  for(let id of data.cards){
    var chk_dt = await db_Select('id', 'md_cal_form_builder', `scope_id = ${data.scope_id} AND sec_id = ${data.sec_id} AND lang_flag = '${data.lang_flag}' AND header_flag="N" AND is_parent = '${data[`p_c_${id}`] > 0 ? 'N': (data[`p_s_c_${id}`] > 0 ? 'N' : 'Y')}' AND parent_id = '${data[`p_c_${id}`] > 0 ? data[`p_c_${id}`] : 0}' AND is_sub_parent = '${data[`p_s_c_${id}`] > 0 ? 'N': 'Y'}' AND sub_parent_id = '${data[`p_s_c_${id}`] > 0 ? data[`p_s_c_${id}`] : 0}'`, null)

    console.log(chk_dt);
    
  }
  res.send(res_dt)
  // let user = req.session.user;
  // // console.log(user);
  // if (!user) {
  //   res.redirect("/login");
  // } else {
  //   var view_data = {
  //     header: 'AI Tag'
  //   }
  //   res.render('test_ai_view', view_data)
  // }
})

app.post('/send_ai_data', (req, res) => {
  const axios = require('axios');

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://sdg-kw-search-api-a38fbc9a8aec.herokuapp.com/ref-docs?mKeyword=Environment',
    headers: { 
      'SDG_API_KEYS': 'X(s)^C#f8D1$6'
    }
  };

  axios.request(config)
  .then((response) => {
    console.log(response.data);
    res.send({suc: 1, msg: response.data})
  })
  .catch((error) => {
    console.log(error);
    res.send({suc: 0, msg: 'No data found'})
  });
  // var data = [
  //   {
  //       "page_content": "1",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 0
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "45",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 44
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "We’ve reduced the size of our overall estate, lowering our carbon footprint. Our \nhybrid approach to work means we’ve greatly reduced the emissions we produce \nfrom commuting. To further reduce travel emissions, in 2023 we introduced an \nelectric car scheme for staff alongside an existing cycle to work scheme. In our \nBristol office, we use motion-controlled lighting to save unnecessary electricity, \nas well as generating our own electricity through solar power.\nWe have an Environmental Policy outlining our commitment to continually \nimproving our environmental performance. Across the next year we aim \nto develop an environmental management system to ISO14001 standard. \nThis will help guide action across key environmental impact areas, such as \nconsumption, waste, biodiversity and travel.",
  //       "metadata": {
  //           "source": "docs\\jisc-sustainability-report-2023.pdf",
  //           "page": 11
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "39 \n Nature and Biodiversity Community Hub  \nThe Nature and Biodiversity Community Hub  is a  community of l ocal groups, \nuniversity staff and students  who have an interest and commitment to protecting \nnature and biodiversity. The hub hosts events and engagement opportunities locally, \nwith a particular focus on young people and local communities. The hub promotes  \nlocal collaboration between students, the university and the community to support the \nlocal environment.  \n \nOperations  \n \nValley Gardens  is a botanic garden  on our Highfield Campus  which  is home to a wide \nvariety of plant and invertebrate species, students, staff and visitors have access to \nthis area and can enjoy the bountiful wildlife , complimented by the well -established \nmental health benefits of regular and unrestricted access to green space.",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 38
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "15 \n Engagement  \n \nCountdown to 2030  \nWorldPop  at the University of Southampton are working with the University of Ghana \nand the Ghana Health Service through the global collaboration C ountdown t o 2030 \nWomen’s, Children’s and Adolescents’ Health.  The collaboration seeks to provide high \nquality evidence at a national and subnational level to improve and enhance the \ncapacity of the Ghana Health Service.  \n \nResearch  into the Aging and Wellbeing of Older People in Kenya  \nOur Centre for Research on Aging has been researching the wellbeing and aging of \nKenyan olde r people living in slum settlements . This research has been used as \nevidence to policy debates and findings have contributed to the introduction of a \nuniversal social pension in Kenya. This research has had wider impacts  across Sub -\nSaharan Africa for the wellbeing and understanding of older people.  \n \nOperations  \n \nThe university provides 24/7 support in halls of residence for students, and all students \ncan access mental health support including  self-help resources, counselling, \nmindfulness  classes and drop -in sessions.  \n \nWe have specially designated rest and study rooms for students with disabilities and \nlong-term health conditions  to ensure these students can study and relax on campus \nin the ways appropriate to them . \n \nWe provide specialist support for those students who identify as neurodivergent and \nthose with specific learning differences. This support may be in the form of 1:1 study \nskills  support or specialist study skills sessions.",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 14
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "34 \n Goal 13. Climate \nAction   \n \nResearch  \n \nAncient Greenhouse Emissions \nInform Potential Future Climate \nScenarios  \nA team of  University of Southampton \nresearchers working in collaboration with \nUniversity of California Santa Cruz drilled \nfossil cores along the Atlantic Coastal \nPlain, using an innovative lase r sampling \ntechnique they sampled plankton to analyse to estimate the carbon content of the \noceans 56 million years ago in the time period around a massive release of \ngreenhouse gasses. This research provides insight into how the Earth’s climate may \nreact in modern times to increasing carbon emissions.   \n \nA Typology for Responsibility for Coastal Risk Adaptation  \nUniversity of Southampton researchers have developed the first disaster risk typology \nof responsibility for coastal flooding . This typology will assist researchers and decision -\nmakers in planning and allocating risk management responsibilities for floods and \nclimate -driven hazards.  \n \nEducation  \n \nStudents on our Environmental Science BSc and Integrated Masters programmes \nhave no compulsory overseas fieldtrips, all fieldtrips are within the UK making use of \nthe wide range of learning opportunities there are within the beautiful local New Forest. \nOur residential field trip takes students to Devon, reducing our transportati on \nemissions considerably from a more remote destination whilst still providing our \nstudents with the high quality teaching and field work  skills so important to this \nacademic field.  \n \nEngagement  \n \nMAST EMERGENCY Festival  \nMAST Mayflower Studios’ EMERGENCY Festival had a range of talks by scientists \nand activists, activities and creative pieces to communicate the severity of the Climate Publications  Field -Weighted \nCitation Impact  Number of Citatio ns \n446 2.51 10027",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 33
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "35 \n Crisis an d other environmental crises. University of Southampton Professor  of Applied \nEnvironmental Science  Ian Williams took part in The Climate Conversation  alongside \nactivists and artists to discuss the climate emergency and engage with the  local public \non the topic.  \n \nOperations  \n \nOur Sustainability Str ategic Plan  sets out our carbon reduction targets. The University \nof Southampton have a target to reduce scope 1 and scope 2 carbon emissions to net \nzero by 2030 and we are working towards developing a robust approach to measuring \nscope 3 emissions and set an ambitious reduction target for scope 3.",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 34
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "24 \n Goal 8. Decent Jobs \nand Economic Growth  \n \nResearch  \n \nIt’s a Man’s World  \nUniversity of Southampton researchers \nhave published work considering the \nissues surrounding women, \ntransportation and work . This publicatio n \nidentifies women’s disadvantages in \nrelation to using transport and the impact \nit has on their ability to engage in working \nlife and progress in their careers. This research concludes that current transport \nsystems, both public and private need to change  to facilitate women’s equal ability to \nwork, with improvements to the safety of public transport and active transport for \nwomen and car s should be designed to be ergonomically as safe for women as they \nare for men.  \n \nWorkers’ Rejection of Returning to the Office  \nResearch by University of Southampton researchers has found that following the \nCOVID -19 pandemic office workers and managers have  found numerous benefits in \nthe working from home model . Benefits include reduced travel and need for transport, \nan improvement in managers’ trust in their workforce and the ability to suit the \nindividual needs of worker s in relation to their work  and wellbeing.  \n \n \nEducation  \n \nMany of our degrees offer work placements or pathways including a year in industry, \nall students on an eligible degree can opt to take part in a Year in  Employment \nPlacement.  Students are provided with support in sourcing employment by Careers, \nEmployability and Student Enterprise, we provide continued support for our students \nduring their year in employment and work to ensure they are able to restart their \nstudies smoothly following the experience. This programme offers students the \nopport unity to develop skills, explore their future employment options and gain \nexperience.  \n \n Publications  Field -Weighted \nCitation Impact  Number of Citations  \n304 2.25 4781",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 23
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "38 \n Goal 15. Life on Land  \n \nResearch  \n \nA Qualitative and Ethnographic \nApproach to Human -Pig Relationships  \nPostgraduate Researcher Kate Goldie is \nundertaking unique ongoing research \nexploring the  affective  relationships \nbetween  livestock animals and humans, \nwith a particular focus on pigs. Through  \nqualitative and ethnographic methods \nand engagement with pigs  in different \ncontexts such as pig sanctuaries, \nhouseholds with pet pigs and research laboratories this research aims to explore the \nethical repercussions of human -pig relationships and improvements to pig welfare.  \n \niDee r \nProfessor of Applied Spatial Ecology Felix Eigenbrod is working in collaboration with \nan interdisciplinary team of University researchers and stakeholders   to develop an \ninteractive decision support t ool to inform land management plans to reduce  deer \nimpacts on natural systems and woodlands.  The tool will map risk of woodland and \nfarmland damage by deer, stakeholders will be able to use the tool to develop and \nmanage woodland plans.  \n \n \n \nEducation  \n \nWe offer a Biodiversity and Conservation Masters  degree programme, students gain \napplicable skills in monitoring species diversity,  population change, abundance and \ndistribution.  Students also learn about the socioeconomic context  and human causes  \nof various environmental issues and gain an understanding of the legal frameworks of \nenvironmental regulation.  \n \n \n \n \nEngagement  \n Publications  Field -Weighted \nCitation Impact  Number of Citations  \n212 2.3 3693",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 37
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "20 \n Goal 6. Clean Water \nand Sanitation  \n \nResearch  \n \nMicroplastics in Fishmeal  \nUniversity of Southampton researchers \nhave found that predicted amounts of \nmicroplastics found in fishmeal  are likely \nunderestimated in the existing literature. \nThey propose environmentally friendly \nmethods of extracting microplastics for \nassessment.  \n \nBuilding Research Capacity for Sustainable Water and Food Security in Sub-\nSaharan Africa (BRECcIA)  \nUniversity of Southampton Researchers are working to develop research networks \nand collaborative research projects across African institutions concerning water and \nfood security as part of BRECcIA  a six university collaboration with eight international \npartner organisations.  \n \nEducation  \n \nWe provide a focused Water Pollution  module, this provides students with a \ncomprehensive understanding of the fundamentals of the issues currently surr ounding \nwater pollution and the science behind the consequences of different types of water \npollutants and their sources and modes of transport into our waterways and marine \nenvironments.  \n \nEngagement  \n \nFuture Towns Innovation Hub  \nThe Future Towns Innovatio n Hub ran a ‘ Sustainable management of water resources \nand the aquatic environment in our future towns’  water workshop with numero us \npresentations from researchers, policymakers, non -governmental organisations and \nindustry partners, facilitating relationships between these groups to tackle the \nchallenges around water in our urban environments.  \nOperations  \n Publications  Field -Weighted \nCitation Impact  Number of Citations  \n180 1.82 2861",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 19
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "Research  ................................ ................................ ................................ ...............  18 \nEducation  ................................ ................................ ................................ ..............  18 \nEngagement  ................................ ................................ ................................ ..........  18 \nOperations  ................................ ................................ ................................ ............  19 \nGoal 6. Clean Water and Sanitation  ................................ ................................ .........  20 \nResearch  ................................ ................................ ................................ ...............  20",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 1
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "36 \n Goal 14. Life Below \nWater   \n \nResearch  \n \nThe Threat of Shipping to Whale \nSharks  \nUniversity of Southampton Researchers  \nand the Marine Biological Association  \nhave identified the threat of industrial \nshipping to endangered whale sharks , \nreporting that current estimates of lethal \ncollisions between the two may be \ndrastically lower than the actual frequency. This research suggests that these lethal \ncollisions may be a key factor in the rapidly declining numbers of whale sharks in our \nocea ns.  \n \nUsing AI and New Mapping Tools to Protect Se agrass  \nEngineers and researchers from the University have used Artificial Intelligence and \nnew mapping tools in Studland Bay to survey and assess the health of seagrass in \nStudland Bay Dorset . Data gathered will be shared with the local community and the \nUniversity will assist in supporting protecting this vital marine habitat.  Seagr ass hosts \na vast variety of marine species and is effective at carbon storage and protecting \nagainst coastal erosion.  \n \n \n \nEducation  \n \nThe University of Southampton is a hosting partner for one of the world’s top \noceanographic institutions  the National Oceanography Centre . This provides our \npostgraduate and undergraduate students the opportunities to study in a world class \nand cutting -edge  facilities, research vessels and a wide range of unique fieldwork \nopportunities.  \n \nEngagement  \n \nThe Fishing App  Publications  Field -Weighted \nCitation Impact  Number of Citations  \n461 1.8 7272",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 35
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "28 \n Goal 10. Reduced \nInequalities  \n \nResearch  \n \nAssessing Flood -Risk Preparedness, \nResponse and Post -Disaster \nReconstruction in Hull Through the \nFrame of Antiblackness: Living the \nAfterlife of Slavery  \nPhD researcher Michael Lomerty ’s research  \nuses  antiblackness  as an epistemology  and a \ntheoretical  ontological  framework  through  \nwhich  to seek  to uncover  truths  in climate  change  discourses.  Aiming to  uncover if and how \nclimate change responses, despite their many positives, appear to mirror other structures of \nsociety where Black lives are definitely not mattering.  \n \nExploring  the Impacts  of Long  Covid  Within  Ethnic  Minority  Groups  \n \nUniversity  of Southampton  researchers  are part of a team  comprising  of numerous  UK \nUniversities  exploring  the symptoms,  healthcare  and treatment  of ethnic  minority  groups  living  \nwith Long  Covid . Connecting  with people  living  with Long  Covid  they are gain an \nunderstanding  of their lived experiences  including  the challenges  they face accessing  support  \nand the impact  Long  Covid  has on their lives.  The project  aims  to promote  culturally  \nappropriate  healthcare  and improve  patient  care and self-management.   \n \nEducation  \n \nAcross our degree programmes we run numerous modules examining inequality, its \ncauses and impacts. Such as our Wellbeing, Inequality & Place  module whi ch \nexamines the unequal distribution of health outcomes across space and examining \ncontemporary issues such as environmental racism, the refugee crisis and food \npoverty. We also provide the module Inequalities in Everyday Worlds  which considers \nthe experiences and meanings of inequality.  \nEngagement  \n \nHomeGrownSO14  \nHomeGrownSO14  is a University skills and knowl edge to residents of the SO14 \npostcode area programme. HomegrownSO14  is working towards university policy that \nenables this transfer of knowledge and skills to local residents, the SO14 is a deprived",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 27
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "29 \n living crisis in this area, acknowledging and eliminating exclusionary research \npractices, structural racism and legacies of colonialism . \n \n  Operations  \n \nThe University of Southampton has a dedicated Equality, Diversity and Inclusion \nStrategic Plan  ensuring everyone feels welcome, included an d supported for who they \nare and equality, diversity and inclusion are embedded in our University Strategy.   \nWe are an accredited Disability Confident Leader , we ask all applicants in their \nsubmission i f they wish to be considered under the Guaranteed Interview scheme. \nVoluntarily opting into this scheme means we offer any applicant with a disability an \ninterview if they meet the minimum requirements of the role.",
  //       "metadata": {
  //           "source": "docs\\SDGReportSRI2.pdf",
  //           "page": 28
  //       },
  //       "type": "Document"
  //   },
  //   {
  //       "page_content": "Jisc annual sustainability report 2023 3\n> Continue to collaborate with the FE and HE sectors on projects to understand the environmental \nimpact of IT/digital in both their operations and supply chain\n> Embed sustainability into advisory activities, providing comprehensive guidance on incorporating \nsustainable practices into digital strategies\n> Establish and maintain an environmental sustainability online community aimed at fostering \ncollaboration, knowledge sharing and support across the FE and HE sectors.",
  //       "metadata": {
  //           "source": "docs\\jisc-sustainability-report-2023.pdf",
  //           "page": 4
  //       },
  //       "type": "Document"
  //   }
  // ]
  // res.send({suc: 1, msg: data})
})

app.get('/data_int', async (req, res) => {
  const { db_Select, db_Insert } = require("./modules/MasterModule"),
  dateFormat = require("dateformat");
  var data = req.query, res_arr = [];
  var all_dt = await db_Select('a.repo_flag, a.sec_id, a.ind_id, a.top_id, a.sl_no, a.ind_agn, a.metric, a.catg, a.unit, a.code, a.words, a.info_title, a.info_desc, a.created_by, a.created_dt, a.modified_by, a.modified_dt, b.topic_id ind_top_id', 'td_sus_dis_top_met a, md_industries_topics b, md_topic c', `a.top_id = b.id AND b.topic_id=c.id AND a.ind_id = ${data.frm_ind_id} AND a.repo_flag = '${data.repo_flag}'`, null)
  // console.log(all_dt);
  if(all_dt.suc > 0){
    var all_ind_id = await db_Select('DISTINCT a.ind_id, b.sec_id', 'md_industries_topics a, md_industries b', `a.ind_id=b.id AND a.repo_flag ='${data.repo_flag}'`, null)
    if(all_ind_id.suc > 0 && all_ind_id.msg.length > 0){
      for(ind_id of all_ind_id.msg){
        var chk_dt = await db_Select('count(id) tot_row', 'td_sus_dis_top_met', `ind_id = ${ind_id.ind_id} AND repo_flag = '${data.repo_flag}'`, null)
        if(chk_dt.msg[0].tot_row != all_dt.msg.length){
          for(let dt of all_dt.msg){
            var frm_ind_top_dt = await db_Select('id, ind_id, topic_id', 'md_industries_topics', `ind_id = ${ind_id.ind_id} AND topic_id = ${dt.ind_top_id}`, null)
            if(frm_ind_top_dt.suc > 0 && frm_ind_top_dt.msg.length > 0){
              var chk = await db_Select('count(id) tot_row', 'td_sus_dis_top_met', `ind_id = ${ind_id.ind_id} AND repo_flag = '${data.repo_flag}' AND top_id = '${frm_ind_top_dt.msg[0].id}' AND sl_no = '${dt.sl_no}'`, null)

              var table_name = 'td_sus_dis_top_met',
                fields = chk.suc > 0 && chk.msg[0].tot_row > 0 ? `repo_flag = '${dt.repo_flag}', sec_id = '${ind_id.sec_id}', ind_id = '${ind_id.ind_id}', top_id = '${frm_ind_top_dt.msg[0].id}', sl_no = '${dt.sl_no}', ind_agn = '${dt.ind_agn}', metric = '${dt.metric}', catg = '${dt.catg}', unit = '${dt.unit}', code = '${dt.code}', words = '${dt.words}', info_title = '${dt.info_title}', info_desc = '${dt.info_desc.split("'").join("\\'")}', created_by = '${dt.created_by}', created_dt = '${dateFormat(dt.created_dt, "yyyy-mm-dd HH:MM:ss")}'` : `(repo_flag, sec_id, ind_id, top_id, sl_no, ind_agn, metric, catg, unit, code, words, info_title, info_desc, created_by, created_dt)`,
                values = `('${dt.repo_flag}', '${ind_id.sec_id}', '${ind_id.ind_id}', '${frm_ind_top_dt.msg[0].id}', '${dt.sl_no}', '${dt.ind_agn}', '${dt.metric}', '${dt.catg}', '${dt.unit}', '${dt.code}', '${dt.words}', '${dt.info_title}', '${dt.info_desc.split("'").join("\\'")}', '${dt.created_by}', '${dateFormat(dt.created_dt, "yyyy-mm-dd HH:MM:ss")}')`,
                whr = chk.suc > 0 && chk.msg[0].tot_row > 0 ? `ind_id = ${ind_id.ind_id} AND repo_flag = '${data.repo_flag}' AND top_id = '${frm_ind_top_dt.msg[0].id}' AND sl_no = '${dt.sl_no}'` : null,
                flag = chk.suc > 0 && chk.msg[0].tot_row > 0 ? 1 : 0;

              var set_res = await db_Insert(table_name, fields, values, whr, flag)
              // console.log(set_res);
              res_arr.push(set_res)
              res.write(JSON.stringify(frm_ind_top_dt.msg[0]))
            }
          }
        }
      }
    }
  }
  // res.json(res_arr)
  res.end('END')
})

app.get('/data_bus_int', async (req, res) => {
  const { db_Select, db_Insert } = require("./modules/MasterModule"),
    dateFormat = require("dateformat");
  var data = req.query,
  name_arr = [];
  var i = 0
  var all_bus_act = await db_Select('b.ind_name, a.repo_flag, a.busi_act_name', 'md_busi_act a, md_industries b', `a.ind_id=b.id AND a.repo_flag = '${data.frm_repo_id}'`, null)
  if(all_bus_act.suc > 0 && all_bus_act.msg.length > 0){
    for(let dt of all_bus_act.msg){
      var ind_dtls = await db_Select('id, sec_id', 'md_industries', `TRIM(ind_name) = "${dt.ind_name.trim()}" AND repo_flag = '${data.to_repo_flag}'`, null)
      console.log(ind_dtls.msg.length, i);
      if(ind_dtls.msg.length > 0) i++
      if(ind_dtls.suc > 0 && ind_dtls.msg.length > 0){
        var chk = await db_Select('count(id) tot_row', 'md_busi_act', `ind_id = '${ind_dtls.msg[0].id}' AND sec_id = '${ind_dtls.msg[0].sec_id}' AND repo_flag = '${data.to_repo_flag}'`, null)
        console.log(chk.msg[0].tot_row, ind_dtls.msg[0].id, ind_dtls.msg[0].sec_id);
        var table_name = 'md_busi_act',
        fields = '(repo_flag, sec_id, ind_id, busi_act_name, created_by, created_dt)',
        values = `('${data.to_repo_flag}', '${ind_dtls.msg[0].sec_id}', '${ind_dtls.msg[0].id}', '${dt.busi_act_name}', 'admin', '${dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss")}')`,
        whr = null,
        flag = 0;
        await db_Insert(table_name, fields, values, whr, flag)
      }else{
        name_arr.push({ind_name: dt.ind_name.trim(), busi_act_name: dt.busi_act_name})
      }
      // console.log();
    }
  }
  console.log(all_bus_act.msg.length, i);
  res.send(all_bus_act)
})

app.get('/test_report', async (req, res) => {
  const { getDynamicData, getSusDiscList, getActMetrialDtls } = require('./modules/DataCollectionModule');
  const { getProjectList, getSavedProjectWork, getGhgEmiList, getActiveTopicList, getCheckedProjectTopList } = require('./modules/ProjectModule');
  const { getCalTypeList } = require('./modules/CalculatorModule');
  const {USER_TYPE_LIST} = require('./modules/MasterModule')
  var enc_data = req.query.enc_data, data_set = {};
    var data = Buffer.from(enc_data, "base64")
    data = JSON.parse(data);
    var resDt = await getDynamicData(0, data.sec_id, data.ind_id, data.top_id, data.flag);
    var susDistList = await getSusDiscList(data.sec_id, data.ind_id, 0, data.flag)
    var metric = await getActMetrialDtls(data.sec_id, data.ind_id, data.flag)
    var editorVal = await getSavedProjectWork(data.sec_id, data.ind_id, data.top_id, data.proj_id, data.flag)
    var topName = resDt.suc > 0 ? (resDt.msg.length > 0 ? resDt.msg[0].topic_name : '') : ''
    var allDynamicData = await getDynamicData(0, data.sec_id, data.ind_id, 0, data.flag);
    var type_list = await getCalTypeList(), act_list = {suc:0,msg:[]}, 
    emi_type = {suc:0,msg:[]};
    var year_list=[], currDate = new Date();
    var ghg_emi_list = await getGhgEmiList(1, 0, data.proj_id)
    ghg_emi_list = ghg_emi_list.suc > 0 ? (ghg_emi_list.msg.length > 0 ? ghg_emi_list.msg : []) : [];
    var scope_list = ghg_emi_list.length > 0 ? ghg_emi_list.map(dt => dt.scope) : []
    scope_list = scope_list.length > 0 ? [...new Set(scope_list)] : [];
    var act_top_catg_list = await getActiveTopicList(data.ind_id, data.flag)
    var get_checked_top_list = await getCheckedProjectTopList(0, data.flag, data.proj_id)
    var project_data = await getProjectList(data.proj_id, 1, 0, data.flag);
    // console.log(project_data);

    var ghg_emi_data = {};
    if(scope_list.length > 0){
        for(let dt of scope_list){
            ghg_emi_data[dt] = ghg_emi_list.filter(fdt => fdt.scope == dt)
        }
    }
    console.log(ghg_emi_data, data.proj_id);
    // console.log(parseInt(currDate.getFullYear()));
    for(let i = 0; i<=6; i++){
        // console.log(i, 'Year');
        year_list.push(parseInt(currDate.getFullYear()) - i)
    }
    allDynamicData = allDynamicData.suc > 0 ? allDynamicData.msg : ''
    // console.log(resDt);
    if (resDt.suc > 0 && resDt.msg.length > 0) {
        if(resDt.msg.length == 1){
            if (resDt.msg[0].data_file_name) {
                resDt = fs.readFileSync(path.join('dynamic_data_set', resDt.msg[0].data_file_name), 'utf-8')
                resDt = JSON.parse(resDt)
            }
        }else{
            for(let dt of resDt.msg){
                if(dt.data_file_name != ''){
                    var dynData = fs.readFileSync(path.join('dynamic_data_set', dt.data_file_name), 'utf-8')
                    data_set[dt.top_id] = JSON.parse(dynData)
                }
            }
        }
    }
    // console.log(req.session.user.ai_tag_tool_flag, 'ai_tag_flag');
    var res_data = {
        top_id: data.top_id, 
        topName,
        sec_id: data.sec_id,
        ind_id: data.ind_id,
        project_id: data.proj_id,
        projName: data.proj_name,
        repo_type: data.repo_type,
        resDt,
        susDistList,
        metric,
        editorData: editorVal.suc > 0 && editorVal.msg.length > 0 ? editorVal.msg : [],
        data_set,
        allDynamicData,
        type_list: type_list.suc > 0 ? type_list.msg : [],
        act_list: act_list.suc > 0 ? act_list.msg : [],
        emi_type: emi_type.suc > 0 ? emi_type.msg : [],
        ghg_emi_data,
        year_list,
        act_top_catg_list: act_top_catg_list.suc > 0 ? act_top_catg_list.msg : [],
        get_checked_top_list: get_checked_top_list.suc > 0 ? get_checked_top_list.msg : [],
        project_data: project_data.suc > 0 ? project_data.msg : [],
        header: "Project Work",
        sub_header: "Project View",
        header_url: `/my_project?flag=${encodeURIComponent(new Buffer.from(data.flag).toString('base64'))}`,
        flag: data.flag,
        user_type_master: USER_TYPE_LIST
    };
  res.render('test_report', res_data)
})

app.get('/sus_dis_top_info_entry', async (req, res) => {
  const { db_Select, db_Insert } = require("./modules/MasterModule"),
  dateFormat = require("dateformat");
  var currDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var data = req.query, res_arr = [], sql_arr = [], i = 1;

  var ind_top_from = await db_Select('a.id, a.ind_id, a.topic_id, b.topic_name', 'md_industries_topics a, md_topic b', `a.topic_id=b.id AND a.ind_id = ${data.frm_ind_id} AND a.repo_flag = '${data.flag}'`, 'ORDER BY a.id')
  if(ind_top_from.suc > 0 && ind_top_from.msg.length > 0){
    for(let dt of ind_top_from.msg){
      var ind_top_to = await db_Select('a.id', 'md_industries_topics a, md_topic b', `a.topic_id=b.id AND a.ind_id = ${data.to_ind_id} AND a.repo_flag = '${data.flag}' AND b.topic_name = "${dt.topic_name}"`)
      if(ind_top_to.suc > 0 && ind_top_to.msg.length > 0){
        var get_top_desc = await db_Select('sl_no, code, words, info_title, info_desc', 'td_sus_dis_top_met', `repo_flag = '${data.flag}' AND sec_id = ${data.sec_id} AND ind_id = ${data.frm_ind_id} AND top_id = ${dt.id}`, 'ORDER BY sl_no')
        // console.log(get_top_desc);
        // break;
        if(get_top_desc.suc > 0 && get_top_desc.msg.length > 0){
          for(let tdt of get_top_desc.msg){
            if(tdt.info_desc != '' && tdt.info_desc != null && tdt.info_desc != 'null'){
              var chk_dt = await db_Select('id', 'td_sus_dis_top_met', `repo_flag = '${data.flag}' AND sec_id = ${data.sec_id} AND ind_id = ${data.to_ind_id} AND top_id = ${ind_top_to.msg[0].id} AND code = "${tdt.code}"`, null)
              // console.log(chk_dt, 'chk');
              sql_arr.push({sql: chk_dt.sql, len: chk_dt.msg.length})
              // break;
              try{
                var table_name = 'td_sus_dis_top_met',
                fields = chk_dt.suc && chk_dt.msg.length > 0 ? `info_title = "${tdt.info_title}", info_desc = '${tdt.info_desc.split("'").join("\\'")}', modified_by = "Subham", modified_dt = '${currDate}'` : '(repo_flag, sec_id, ind_id, top_id, sl_no, code, words, info_title, info_desc, created_by, created_dt)',
                values = `('${data.flag}', ${data.sec_id}, ${data.to_ind_id}, ${ind_top_to.msg[0].id}, ${tdt.sl_no}, "${tdt.code}", "${tdt.words}", '${tdt.info_title}', '${tdt.info_desc.split("'").join("\\'")}', "Subham", '${currDate}')`,
                whr = chk_dt.suc && chk_dt.msg.length > 0 ? `id=${chk_dt.msg[0].id}` : null,
                flag = chk_dt.suc && chk_dt.msg.length > 0 ? 1 : 0;
                await db_Insert(table_name, fields, values, whr, flag)
              }catch(err){
                console.log(err);
              }
            }
          }
        }
        // break;
      }else{
        res_arr.push(dt)
      }
    }
  }
  console.log(i);
  res.send(sql_arr)
})

app.get('/insert_ifrs_sus_dis', async (req, res) => {
  const { db_Select, db_Insert } = require("./modules/MasterModule"),
  dateFormat = require("dateformat");
  var currDate = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
  var data = req.query, res_arr = [], sql_arr = [], i = 1;

  var ind_top_from = await db_Select('a.id, b.sec_name, c.ind_name, e.topic_name, a.metric, a.catg, a.unit, a.code, a.words, a.info_title, a.info_desc', 'td_sus_dis_top_met a, md_sector b, md_industries c, md_industries_topics d, md_topic e', `a.sec_id=b.id AND a.ind_id=c.id AND a.top_id=d.id AND d.topic_id=e.id AND a.repo_flag = 'G' AND e.topic_name LIKE "GRI%"`, 'ORDER BY a.id')

  if(ind_top_from.suc > 0 && ind_top_from.msg.length > 0){
    for(let tdt of ind_top_from.msg){
      
    }
  }
})

app.use(UserRouter);
app.use(MasterRouter);
app.use(DataCollectionRouter)
app.use(SubsRouter)
app.use(ProjectRouter)
app.use(DashboardRouter)
app.use(SupportRouter)
app.use(imgGalaryRouter)
app.use(CalculatorRouter)

app.use(FBRouter)
app.use(CalcUserRouter)

app.get("/user_data", (req, res) => {
  var data = {
    dt: [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
      { id: 4, name: "d" },
      { id: 5, name: "e" },
      { id: 6, name: "f" },
    ],
  };
  // console.log(data);
  res.send(data);
});

// LISTEN SERVER //
app.listen(port, (err) => {
  if (err) throw new Error(err);
  else console.log(`App is running at http://localhost:${port}`);
});
// END //

// server.listen(port, (err) => {
//   if (err) throw new Error(err);
//   else console.log(`App is running at https://localhost:${port}`);
// });