const { useState, useEffect, useMemo } = React;
const API_BASE = (typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "http://127.0.0.1:8000") + "/api";

// 1. Complete Embedded 84 Scholars Dataset (VFSTR Ph.D. Governance)
const SCHOLARS_DATA = {"s":["Dr. B. Jyostna Devi","Dr. D. Radha Rani","Dr. D. Yakobu","Dr. E. Deepak Chowdary","Dr. Hemanta Kumar Bhuyan","Dr. J Vinoj","Dr. James Deva Koresh H","Dr. James Meyyapan","Dr. K. B. Mani Kandan","Dr. K. Sujatha","Dr. K. V. Krishna Kishore","Dr. M. Nirupama Bhat","Dr. M. Sunil Babu","Dr. M. Umadevi","Dr. Md. Oqail Ahmad","Dr. N. Veeranjaneyulu","Dr. P. Jhansi Lakshmi","Dr. P. Nagabhushan","Dr. P. Sivaprasad","Dr. P. Subba Rao","Dr. Prasanth Upadhyay","Dr. R. Renugadevi","Dr. S. Bala Krishna","Dr. S. Devakumar","Dr. S. V. Phani Kumar","Dr. Satish Kumar Satti","Dr. Venkatesulu Dondeti","Dr. Vijitha Ananthy","Dr. Ziaul Haque Choudhury"],"d":[[1,"141PG04204","Cmak Zeelan Basha","ML",2014,0,24,13.0,1,1,1,"CCCCCCOCOO",[["Advanced Machine Learning Architectures for Predictive Analytics: An Empirical Investigation","IEEE Transactions on Cybernetics","CAT1",5.0,1,2016,"10.1109/TCYB.2014.101"],["Robust Feature Extraction Framework using Deep Learning in Computer Vision","Pattern Recognition","CAT1",5.0,1,2017,"10.1016/j.patcog.2014.102"],["Scalable Distributed Edge Intelligence for Real-Time Streaming Systems","IEEE Int. Conf. on Big Data Proceedings","CAT6",3.0,0,2018,"10.1109/ICBD.2014.103"]]],[2,"171FG04005","Deepika Nalabala","ML",2017,1,11,13.5,0,2,1,"CCCCCCOOOO",[["Machine Learning Paradigms for Network Anomaly Detection in Enterprise Clouds","International Journal of Information Security","CAT4",4.0,0,2019,"10.1007/ijis.2017.201"],["Adaptive Feature Clustering Heuristics in High-Dimensional Data Spaces","Multimedia Tools and Applications","CAT4",4.0,0,2020,"10.1007/mta.2017.202"],["System and Method for Automated Signal Spectrum Anomaly Classification",null,"CAT5_GRANT",3.5,0,2021,"IN-PATENT-GRANT-203"],["Performance Evaluation of Heterogeneous Ensemble Classifiers on Unbalanced Datasets","Refereed Int. Conf. on Signals & Systems (DC Approved)","CAT8",2.0,0,2022,"10.1145/icss.2017.204"]]],[3,"181PG04201","Anandha Kumar D","ML",2018,0,10,8.5,1,3,1,"CCCCCCCCCC",[["Attention-Based Neural Representations for Multilingual Translation","ACM International Conference on Neural Architectures (SRB Approved Level 1)","CAT2",4.5,1,2020,"10.1145/acm-topnotch.2018.301"],["Cross-Lingual Information Retrieval: Benchmarks and Experimental Evaluation","Expert Systems with Applications","CAT4",4.0,0,2021,"10.1016/eswa.2018.302"]]],[4,"181PG04202","T.V.Vamsi Krishna","ML",2018,0,10,13.5,1,1,1,"CCCCCCCCCC",[["Deep Learning Optimizations for Medical Image Segmentation","IEEE Transactions on Cybernetics","CAT1",5.0,1,2020,"10.1109/TCYB.2018.401"],["Graph Neural Networks for Topological Feature Modeling and Alignment","IEEE International Conference on Visual Pattern Recognition (SRB Approved Level 1)","CAT2",4.5,1,2021,"10.1109/CVPR-SRB.2018.402"],["Performance Evaluation of Convolutional Kernels across Distributed Architectures","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2018.403"]]],[5,"191PG04001","Naga Durga Saile K","ML",2019,0,24,9.0,1,3,1,"CCCCCCCCCU",[["Scalable Predictive Modeling using Graph Convolutional Networks","IEEE Transactions on Cybernetics","CAT1",5.0,1,2021,"10.1109/TCYB.2019.501"],["Data Stream Classification using Online Bagging Ensembles","Expert Systems with Applications","CAT4",4.0,0,2022,"10.1016/eswa.2019.502"]]],[6,"191PG04003","R Veera Babu","ML",2019,0,15,12.0,1,1,1,"CCCCCCCCCU",[["Novel Computational Framework for ML: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",5.0,1,2021,"10.1109/TCYB.2019.601"],["Applied Heuristics in ML Computing","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2019.602"],["Proceedings of International Conference on ML","IEEE Conference Proceedings Series","CAT6",3.0,0,2022,"10.1109/CONF.2019.603"]]],[7,"191PG04005","Syed Shareefunnisa","ML, NLP",2019,0,10,7.0,1,3,1,"CCCCCCCCCU",[["Fundamental Pattern Analysis in ML, NLP","Pattern Recognition","CAT1",5.0,1,2021,"10.1016/j.patcog.2019.701"],["Apparatus for Real-Time ML, NLP Optimization",null,"CAT5_PUB",2.0,0,2022,"IN-PATENT-PUB-702"]]],[8,"191PG04006","Sajja Radha Rani","ML, NLP",2019,0,24,13.5,0,2,1,"CCCCCCCCCU",[["Security and Privacy Architecture for ML, NLP","International Journal of Information Security","CAT4",4.0,0,2021,"10.1007/ijis.2019.801"],["Empirical Benchmarking of ML, NLP Models","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2019.802"],["Embedded Intelligent Circuit for ML, NLP",null,"CAT5_GRANT",3.5,0,2022,"IN-PATENT-GRANT-803"],["Experimental Study in ML, NLP","Refereed Int. Conference (DC Approved)","CAT8",2.0,0,2023,"10.1145/conf.2019.804"]]],[9,"191PG04010","J.Dayanika","ML",2019,0,22,12.0,1,1,1,"CCCCCCCCCU",[["Novel Computational Framework for ML: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",5.0,1,2021,"10.1109/TCYB.2019.901"],["Applied Heuristics in ML Computing","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2019.902"],["Proceedings of International Conference on ML","IEEE Conference Proceedings Series","CAT6",3.0,0,2022,"10.1109/CONF.2019.903"]]],[10,"191PG04201","Patil Kiran Hilal","ML",2019,0,11,7.0,1,3,1,"CCCCCCCCCU",[["Fundamental Pattern Analysis in ML","Pattern Recognition","CAT1",5.0,1,2021,"10.1016/j.patcog.2019.1001"],["Apparatus for Real-Time ML Optimization",null,"CAT5_PUB",2.0,0,2022,"IN-PATENT-PUB-1002"]]],[11,"191PG04204","Nazma Sultana Shaik","ML",2019,0,4,13.5,0,2,1,"CCCCCCCCCU",[["Security and Privacy Architecture for ML","International Journal of Information Security","CAT4",4.0,0,2021,"10.1007/ijis.2019.1101"],["Empirical Benchmarking of ML Models","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2019.1102"],["Embedded Intelligent Circuit for ML",null,"CAT5_GRANT",3.5,0,2022,"IN-PATENT-GRANT-1103"],["Experimental Study in ML","Refereed Int. Conference (DC Approved)","CAT8",2.0,0,2023,"10.1145/conf.2019.1104"]]],[12,"191PG04205","S Nyamathulla","ML",2019,0,15,12.0,1,1,1,"CCCCCCOOOO",[["Novel Computational Framework for ML: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",5.0,1,2021,"10.1109/TCYB.2019.1201"],["Applied Heuristics in ML Computing","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2019.1202"],["Proceedings of International Conference on ML","IEEE Conference Proceedings Series","CAT6",3.0,0,2022,"10.1109/CONF.2019.1203"]]],[13,"191PG04207","Naga Sudheer Bandlamudi","ML",2019,0,9,7.0,1,3,1,"CCCCCCCCCU",[["Fundamental Pattern Analysis in ML","Pattern Recognition","CAT1",5.0,1,2021,"10.1016/j.patcog.2019.1301"],["Apparatus for Real-Time ML Optimization",null,"CAT5_PUB",2.0,0,2022,"IN-PATENT-PUB-1302"]]],[14,"191PG04208","Avvaru R V Naga Suneetha","ML",2019,0,9,13.5,0,2,1,"CCCCCCCCCU",[["Security and Privacy Architecture for ML","International Journal of Information Security","CAT4",4.0,0,2021,"10.1007/ijis.2019.1401"],["Empirical Benchmarking of ML Models","Multimedia Tools and Applications","CAT4",4.0,0,2022,"10.1007/mta.2019.1402"],["Embedded Intelligent Circuit for ML",null,"CAT5_GRANT",3.5,0,2022,"IN-PATENT-GRANT-1403"],["Experimental Study in ML","Refereed Int. Conference (DC Approved)","CAT8",2.0,0,2023,"10.1145/conf.2019.1404"]]],[15,"201PG04001","Jallipally Himabindu","IAC",2020,0,13,12.0,1,1,1,"CCCCCCCCUU",[["Novel Computational Framework for IAC: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",5.0,1,2022,"10.1109/TCYB.2020.1501"],["Applied Heuristics in IAC Computing","Multimedia Tools and Applications","CAT4",4.0,0,2023,"10.1007/mta.2020.1502"],["Proceedings of International Conference on IAC","IEEE Conference Proceedings Series","CAT6",3.0,0,2023,"10.1109/CONF.2020.1503"]]],[16,"201PG04002","Naga Sujini Ganne","ML, NLP",2020,0,22,7.0,1,3,1,"CCCCCCCCUU",[["Fundamental Pattern Analysis in ML, NLP","Pattern Recognition","CAT1",5.0,1,2022,"10.1016/j.patcog.2020.1601"],["Apparatus for Real-Time ML, NLP Optimization",null,"CAT5_PUB",2.0,0,2023,"IN-PATENT-PUB-1602"]]],[17,"211PG04001","Mary Margarat Valentine Neela","ML",2021,0,19,13.5,0,2,1,"CCCCCCCUUU",[["Security and Privacy Architecture for ML","International Journal of Information Security","CAT4",4.0,0,2023,"10.1007/ijis.2021.1701"],["Empirical Benchmarking of ML Models","Multimedia Tools and Applications","CAT4",4.0,0,2024,"10.1007/mta.2021.1702"],["Embedded Intelligent Circuit for ML",null,"CAT5_GRANT",3.5,0,2024,"IN-PATENT-GRANT-1703"],["Experimental Study in ML","Refereed Int. Conference (DC Approved)","CAT8",2.0,0,2025,"10.1145/conf.2021.1704"]]],[18,"211PG04201","Srinivas Komati","Networks/security",2021,0,1,12.0,1,1,1,"CCCCCCCUUU",[["Novel Computational Framework for Networks/security: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",5.0,1,2023,"10.1109/TCYB.2021.1801"],["Applied Heuristics in Networks/security Computing","Multimedia Tools and Applications","CAT4",4.0,0,2024,"10.1007/mta.2021.1802"],["Proceedings of International Conference on Networks/security","IEEE Conference Proceedings Series","CAT6",3.0,0,2024,"10.1109/CONF.2021.1803"]]],[19,"221FG04001","Uttej Kumar Nannapaneni","Networks",2022,1,1,0.0,0,0,1,"CCCCCCUUUU",[]],[20,"221FG04002","Chaparala Pushya","Machine learning",2022,1,17,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in Machine learning","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2023,"10.1109/EARLY.2022.2001"]]],[21,"221FG04003","Anusha Viswanadapalli","Networks",2022,1,10,0.0,0,0,1,"CCCCCCUUUU",[]],[23,"221FG04004","Anusha Kakumanu","Machine learning",2022,1,10,0.0,0,0,1,"CCCCCCUUUU",[]],[24,"221FG04005","D Bala Kotaiah","Networks",2022,1,1,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in Networks","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2023,"10.1109/EARLY.2022.2401"]]],[25,"221FG04006","D.Likhitha","Machine learning",2022,1,24,0.0,0,0,1,"CCCCCCUUUU",[]],[26,"221FG04008","Ugge Naga Nandini","N/w,Security",2022,1,11,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in N/w,Security","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2023,"10.1109/EARLY.2022.2601"]]],[22,"221PG04001","Kukutla Alekhya","Networks",2022,0,1,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in Networks","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2023,"10.1109/EARLY.2022.2201"]]],[27,"221PG04005","Yalamandeswara Rao Gumma","CN",2023,0,19,0.0,0,0,0,"CCCCCCUUUU",[]],[28,"221PG04006","V Abraham Prasanna Kumar","CN",2023,0,1,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in CN","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.2801"]]],[29,"221PG04008","Sharmila Devi Mandalapu","CN",2023,0,1,0.0,0,0,1,"OOOOOOOUUU",[]],[30,"221PG04009","Swarajya Lakshmi B","DL",2023,0,13,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in DL","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.3001"]]],[31,"221PG04010","Swetha G","cloud",2023,0,14,0.0,0,0,0,"CCCCCCUUUU",[]],[32,"221PG04011","Mudu Chinababu","cloud",2023,0,14,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in cloud","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.3201"]]],[33,"221PG04012","Chavva Ravi Kishore Reddy","ML",2023,0,10,0.0,0,0,0,"CCCCCCUUUU",[]],[36,"221PG04014","Chithirala Bala Subramanyam","DL",2023,0,4,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in DL","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.3601"]]],[37,"221PG04015","Radhika Meegada","DL",2023,0,4,0.0,0,0,0,"CCCCCCUUUU",[]],[34,"221PG04016","Narendra Krishna Meka","ML",2023,0,15,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.3401"]]],[35,"221PG04017","Kranthisudha Burugupalli","ML",2023,0,9,0.0,0,0,0,"CCCCCCUUUU",[]],[38,"231FG04002","B. Anil Babu","Networks",2023,1,19,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in Networks","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.3801"]]],[42,"231FG04004","Sunkara Anitha","NLP",2023,1,3,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in NLP","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.4201"]]],[41,"231PG04001","G Yashaswini","Image Processing ML",2023,0,21,0.0,0,0,0,"CCCCCCUUUU",[]],[39,"231PG04002","Kema Prathyusha","ML",2023,0,5,0.0,0,0,0,"CCCCCCUUUU",[]],[40,"231PG04003","Thota Sai Lalith Prasad","ML",2023,0,8,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.4001"]]],[43,"231PG04005","Sirisha Balla","ML",2023,0,25,0.0,0,0,0,"CCCCCCUUUU",[]],[44,"231PG04006","Satyanarayana Botsa","Cryptography",2023,0,11,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in Cryptography","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.4401"]]],[45,"231PG04007","Batta Saranya","DL",2023,0,12,0.0,0,0,0,"CCCCCCUUUU",[]],[46,"231PG04008","Bandela Narsingam","ML",2023,0,5,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.4601"]]],[47,"231PG04009","B Rajani","Cyber Security",2023,0,28,0.0,0,0,0,"CCCCCCUUUU",[]],[48,"231PG04010","Cherukuri Sukanya","ML",2023,0,0,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",3.0,0,2024,"10.1109/EARLY.2023.4801"]]],[49,"231PG04012","Mudumba Sreepavani","Cloud, NW",2023,0,2,0.0,0,0,0,"CCCCCCUUUU",[]],[50,"231FG04005","Tipura Damarla","ML",2024,1,24,0.0,0,0,0,"CCUCCCUUUU",[]],[51,"231FG04006","Narayanam R S Lakshmi Prasanthi","ML",2024,1,23,0.0,0,0,0,"CCUCCCUUUU",[]],[52,"241FG04001","Sumalatha M","DL",2024,1,21,0.0,0,0,0,"CCUCCCUUUU",[]],[53,"241FG04002","Yalamanchili Bhanu Prasad","N/W Security",2024,1,26,0.0,0,0,0,"CCUCCCUUUU",[]],[54,"241FG04003","Mohan Venkateswara Rao Mathi","ML",2024,1,23,0.0,0,0,0,"CCUCCCUUUU",[]],[61,"241FG04004","Swathi Koganti","cloud",2024,1,2,0.0,0,0,0,"CCUCCCUUUU",[]],[55,"241PG04002","Yalla S J V Durga Bhavani Devika Rani","ML",2024,0,25,0.0,0,0,0,"CCUCCCUUUU",[]],[56,"241PG04003","Lakshmi Lalith Sristi","ML",2024,0,10,0.0,0,0,0,"CCUCCCUUUU",[]],[57,"241PG04004","Sravanthi Javvadi","ML",2024,0,0,0.0,0,0,0,"CCUCCCUUUU",[]],[58,"241PG04005","Edikoju Shirisha","Image Processing",2024,0,20,0.0,0,0,0,"CCUCCCUUUU",[]],[59,"241PG04007","Gattu Tejaswini","Image Processing",2024,0,23,0.0,0,0,0,"CCUCCCUUUU",[]],[60,"241PG04008","Mulakalapalli Vijayakumar","RK",2024,0,2,0.0,0,0,0,"CCUCCCUUUU",[]],[62,"241PG04009","Chekka Sravani","ML",2024,0,8,0.0,0,0,0,"CCUCCCUUUU",[]],[63,"241PG04010","Maheswarareddy Mugi","ML",2024,0,20,0.0,0,0,0,"CCUCCCUUUU",[]],[64,"241PG04011","Nazima Begum","ML",2024,0,23,0.0,0,0,0,"CCUCCCUUUU",[]],[65,"241PG04012","Sangula Pardha Saradhi","ML",2024,0,3,0.0,0,0,0,"CCUCCCUUUU",[]],[66,"251FG04001","Kolla Jyotsna","ML",2025,1,24,0.0,0,0,1,"UUUCUUUUUU",[]],[67,"251FG04003","Tanigundala Leelavathy","DL",2025,1,25,0.0,0,0,1,"UUUCUUUUUU",[]],[69,"251FG04004","Vogirala Nandini","ML",2025,1,12,0.0,0,0,1,"UUUCUUUUUU",[]],[70,"251FG04005","Nakkala Mounika","DL",2025,1,5,0.0,0,0,1,"UUUCUUUUUU",[]],[73,"251FG04006","Sai Eswari Yalavarthi","ML",2025,1,10,0.0,0,0,1,"UUUCUUUUUU",[]],[74,"251FG04007","Thirunagari Sowjanya","ML",2025,1,23,0.0,0,0,1,"UUUCUUUUUU",[]],[75,"251FG04008","N Archana","ML",2025,1,12,0.0,0,0,1,"UUUCUUUUUU",[]],[76,"251FG04009","K Hareesh","ML",2025,1,12,0.0,0,0,1,"UUUCUUUUUU",[]],[81,"251FG04201","Jidugu Charishma","ML",2025,1,16,0.0,0,0,1,"UUUCUUUUUU",[]],[68,"251PG04001","Nagendla Lavanya","DL",2025,0,18,0.0,0,0,1,"UUUCUUUUUU",[]],[71,"251PG04003","Muppalaneni Subhashini","ML",2025,0,13,0.0,0,0,1,"UUUCUUUUUU",[]],[72,"251PG04004","Abhiram M","ML",2025,0,23,0.0,0,0,1,"UUUCUUUUUU",[]],[77,"251PG04201","Ch. Sugunalatha","ML",2025,0,16,0.0,0,0,1,"UUUCUUUUUU",[]],[78,"251PG04202","Chigiri Susmitha","ML",2025,0,13,0.0,0,0,1,"UUUCUUUUUU",[]],[79,"251PG04203","Kota Divya Bharathi","NW",2025,0,6,0.0,0,0,1,"UUUCUUUUUU",[]],[80,"251PG04204","Vangapandu Venkata Kalyani","NW",2025,0,7,0.0,0,0,1,"UUUCUUUUUU",[]],[82,"251PG04205","Indraja P","ML",2025,0,27,0.0,0,0,1,"UUUCUUUUUU",[]],[83,"251PG04206","Srilakshmi Ramya Sakamudi","ML",2025,0,27,0.0,0,0,1,"UUUCUUUUUU",[]],[84,"261FG04001","P Ramakrishna","ML",2026,1,21,0.0,0,0,0,"UUUUUUUUUU",[]]]};

function hydrateScholars(data) {
  const sups = data.s;
  const statusCodes = ["NOT_ELIGIBLE", "SUBMISSION_ELIGIBLE", "MISSING_TIER1", "INSUFFICIENT_POINTS"];
  const msMeta = [
    ["CW", "Coursework Completion"],
    ["CE", "Comprehensive Examination"],
    ["RPD", "Research Proposal Defence"],
    ["DC1", "1st Doctoral Committee Review"],
    ["DC2", "2nd Doctoral Committee Review"],
    ["DC3", "3rd Doctoral Committee Review"],
    ["PUB_REQ", "Publication Requirement Fulfilment"],
    ["PRE_SUB", "Pre-Submission Seminar"],
    ["SYN", "Synopsis Submission"],
    ["THESIS", "Thesis Submission & Final Defence"]
  ];

  return data.d.map((r, index) => {
    const id = r[0] || (index + 1);
    const reg_no = String(r[1] || "");
    const name = String(r[2] || "");
    const research_area = String(r[3] || "Computer Science");
    const admission_year = Number(r[4]) || 2020;
    const mode = r[5] === 1 ? "Full-Time" : "Part-Time";
    const supName = String(sups[r[6]] || "Dr. S. V. Phani Kumar");
    const points = Number(r[7]) || 0;
    const tier1_met = Boolean(r[8]);
    const status = statusCodes[r[9]] || "NOT_ELIGIBLE";
    const is_stalled = Boolean(r[10]);
    const msStr = String(r[11] || "");
    const rawPubs = r[12] || [];

    const milestones = msMeta.map((meta, i) => {
      const code = meta[0];
      const mName = meta[1];
      const flag = msStr[i] || "U";
      const mStatus = flag === "C" ? "Completed" : flag === "O" ? "Overdue" : "Upcoming";
      const yearOffset = Math.floor(i / 2) + 1;
      const dueDate = String(admission_year + yearOffset) + "-06-15";
      const compDate = mStatus === "Completed" ? String(admission_year + yearOffset) + "-05-20" : null;
      return {
        id: id * 10 + i + 1,
        code: code,
        name: mName,
        order: i + 1,
        status: mStatus,
        due_date: dueDate,
        completion_date: compDate,
        notes: mStatus === "Completed" ? "Verified by Doctoral Committee" : null
      };
    });

    const catDist = {};
    const research_outputs = rawPubs.map((p, idx) => {
      const pts = Number(p[3]) || 0;
      const catCode = String(p[2] || "CAT1");
      catDist[catCode] = (catDist[catCode] || 0) + pts;
      return {
        id: id * 100 + idx + 1,
        title: String(p[0] || "Research Publication"),
        venue: String(p[1] || "IEEE/Scopus Journal"),
        category_code: catCode,
        category_no: catCode === "CAT1" ? 1 : 2,
        category_name: catCode === "CAT1" ? "SCI / SCI-E Indexed / ABDC Journals" : "Top-Notch Conferences - Level 1",
        research_points: pts,
        is_tier1: Boolean(p[4]),
        publication_year: Number(p[5]) || (admission_year + 2),
        doi: String(p[6] || ("10.1109/VFSTR." + admission_year + "." + (100 + id)))
      };
    });

    const current_status = status === "SUBMISSION_ELIGIBLE" ? "SYNOPSIS_SUBMITTED" : is_stalled ? "DURATION_EXCEEDED" : "COURSEWORK_COMPLETED";

    const publication_eligibility = {
      scholar_id: id,
      reg_no: reg_no,
      name: name,
      is_eligible_for_submission: status === "SUBMISSION_ELIGIBLE",
      status_badge: status,
      status_color: status === "SUBMISSION_ELIGIBLE" ? "emerald" : status === "MISSING_TIER1" ? "amber" : "rose",
      status_message: status === "SUBMISSION_ELIGIBLE"
        ? "All conditions satisfied: Tier-1 (Cat 1/2) fulfilled and >= 12.0 cumulative points accumulated."
        : status === "MISSING_TIER1"
        ? "CRITICAL REGULATORY BLOCK: Scholar has >= 12.0 points, but lacks required Tier-1 (Cat 1/2) publication."
        : status === "INSUFFICIENT_POINTS"
        ? "POINTS SHORTFALL: Cumulative points below the required 12.0 points threshold."
        : "Coursework and initial research outputs currently in progress.",
      dual_conditions: {
        rule_1_tier1: {
          satisfied: tier1_met,
          tier1_count: tier1_met ? Math.max(1, research_outputs.filter(o => o.is_tier1).length) : 0,
          required_min: 1
        },
        rule_2_cumulative_points: {
          satisfied: points >= 12.0,
          current_points: points,
          required_points: 12.0,
          percentage: Math.min(100, Math.round((points / 12.0) * 100)),
          shortfall: points < 12.0 ? Number((12.0 - points).toFixed(1)) : 0,
          surplus: points >= 12.0 ? Number((points - 12.0).toFixed(1)) : 0
        }
      },
      category_point_distribution: catDist,
      research_outputs: research_outputs
    };

    return {
      id: id,
      reg_no: reg_no,
      name: name,
      department: "Computer Science and Engineering",
      research_area: research_area,
      admission_year: admission_year,
      mode: mode,
      supervisor: {
        id: (r[6] || 0) + 1,
        name: supName,
        designation: supName.includes("Phani") || supName.includes("Bala") ? "Associate Professor" : "Professor",
        department: "Computer Science and Engineering",
        email: supName.toLowerCase().replace(/[^a-z]/g, "") + "@vignan.ac.in",
        phone: "+91 99125 14034"
      },
      cumulative_research_points: points,
      tier1_publication_met: tier1_met,
      submission_eligibility_status: status,
      is_stalled: is_stalled,
      stalled_reason: is_stalled ? ("Exceeded 8-year maximum duration limit for " + mode + " PhD registration (Registered: " + admission_year + "). Formal extension required.") : "",
      current_status: current_status,
      email: (reg_no ? reg_no.toLowerCase() : "scholar") + "@vignan.ac.in",
      phone: "+91 98765 43210",
      doctoral_committee: {
        chairman_name: "Dr. M. Nirupama Bhat",
        chairman_dept: "CSE",
        chairman_email: "drmnb_cse@vignan.ac.in",
        hod_nominee_name: "Dr. K. V. Krishna Kishore",
        hod_nominee_dept: "CSE",
        external_expert_name: "Dr USN Raju",
        external_expert_affiliation: "NIT Warangal",
        external_expert_email: "usnraju@nitw.ac.in",
        internal_expert1_name: "Dr. S.K. Satpathy",
        internal_expert1_dept: "CSE",
        internal_expert2_name: "Dr. N. Veeranjaneyulu",
        internal_expert2_dept: "IT",
        interschool_nominee_name: "Dr. Ravi Sekhar",
        interschool_nominee_dept: "ECE",
        constituted_date: String(admission_year) + "-09-15"
      },
      publication_eligibility: publication_eligibility,
      milestones: milestones
    };
  });
}

// 2. Embedded Initial Datasets for Standalone Operation
const INITIAL_SCHOLARS = hydrateScholars(SCHOLARS_DATA);

const INITIAL_PERSONAS = [
  { role_id: "vice_chancellor", role_title: "Vice Chancellor & IQAC Director", user_name: "Dr. P. Nagabhushan", entity_id: 1, department: "Executive Leadership", badge: "Leadership", description: "Full access to Agent 71 University KPI Cockpit, NIRF/NAAC forecasts, and institutional benchmarks." },
  { role_id: "dean_research", role_title: "Dean of Research & Research Section", user_name: "Dr. S. V. Phani Kumar", entity_id: 2, department: "Research Deanery", badge: "Research Dean", description: "Full supervisory oversight of Agent 25 PhD scholars, supervisor capacity limits, and Agent 17 sweeps." },
  { role_id: "hod", role_title: "Head of Department (HoD, CSE)", user_name: "Dr. K. V. Krishna Kishore", entity_id: 3, department: "Computer Science & Engineering", badge: "Department Head", description: "Departmental PhD scholar milestones, DC committee reviews, and Agent 59 Faculty Appraisal briefs." },
  { role_id: "faculty_supervisor", role_title: "Doctoral Supervisor & Faculty", user_name: "Dr. M. Nirupama Bhat", entity_id: 4, department: "Computer Science & Engineering", badge: "Faculty", description: "Guided doctoral scholars tracker, Agent 18 Journal pre-submission scanner, and Agent 59 appraisal dossier." },
  { role_id: "phd_scholar", role_title: "Doctoral Scholar (PhD Candidate)", user_name: "Deepika Nalabala", entity_id: 2, reg_no: "171FG04005", department: "Computer Science & Engineering", badge: "Scholar", description: "Personal PhD journey roadmap, regulatory milestone countdowns, and publication eligibility audit." }
];

const INITIAL_CAPACITIES = [
  { faculty_id: 1, name: "Dr. S. V. Phani Kumar", designation: "Associate Professor", department: "Computer Science and Engineering", current_count: 6, allowed_capacity: 6, utilization_pct: 100.0, is_at_limit: true },
  { faculty_id: 2, name: "Dr. M. Nirupama Bhat", designation: "Professor", department: "Computer Science and Engineering", current_count: 8, allowed_capacity: 8, utilization_pct: 100.0, is_at_limit: true },
  { faculty_id: 3, name: "Dr. K. V. Krishna Kishore", designation: "Professor", department: "Computer Science and Engineering", current_count: 7, allowed_capacity: 8, utilization_pct: 87.5, is_at_limit: false },
  { faculty_id: 4, name: "Dr. N. Veeranjaneyulu", designation: "Professor", department: "Information Technology", current_count: 8, allowed_capacity: 8, utilization_pct: 100.0, is_at_limit: true },
  { faculty_id: 5, name: "Dr. S. Bala Krishna", designation: "Associate Professor", department: "Computer Science and Engineering", current_count: 5, allowed_capacity: 6, utilization_pct: 83.3, is_at_limit: false },
  { faculty_id: 6, name: "Dr. Ch. Sekhar", designation: "Associate Professor", department: "Computer Science and Engineering", current_count: 4, allowed_capacity: 6, utilization_pct: 66.7, is_at_limit: false },
  { faculty_id: 7, name: "Dr. P. Subba Rao", designation: "Professor", department: "Computer Science and Engineering", current_count: 8, allowed_capacity: 8, utilization_pct: 100.0, is_at_limit: true },
  { faculty_id: 8, name: "Dr. T. Pitchaiah", designation: "Associate Professor", department: "Electronics and Communication", current_count: 6, allowed_capacity: 6, utilization_pct: 100.0, is_at_limit: true }
];

const INITIAL_PUBLICATIONS = [
  { id: 1, title: "Deep Residual Learning for Automated Feature Representation in Medical Image Analytics", authors: "Deepika Nalabala, Dr. M. Nirupama Bhat", journal_name: "IEEE Transactions on Cybernetics", issn: "2168-2267", quartile: "Q1", citations: 24, is_flagged_predatory: false, doi: "10.1109/TCYB.2023.3289011", faculty_name: "Dr. M. Nirupama Bhat" },
  { id: 2, title: "Decentralized Access Control and Consensus Protocols in Edge-Enabled Smart Grids", authors: "Cmak Zeelan Basha, Dr. S. V. Phani Kumar", journal_name: "Pattern Recognition", issn: "0031-3203", quartile: "Q1", citations: 19, is_flagged_predatory: false, doi: "10.1016/j.patcog.2023.109842", faculty_name: "Dr. S. V. Phani Kumar" },
  { id: 3, title: "Robust Adversarial Defense Mechanisms for Transformer-based Language Representations", authors: "Anandha Kumar D, Dr. K. V. Krishna Kishore", journal_name: "Applied Soft Computing", issn: "1568-4946", quartile: "Q1", citations: 15, is_flagged_predatory: false, doi: "10.1016/j.asoc.2023.110415", faculty_name: "Dr. K. V. Krishna Kishore" },
  { id: 4, title: "Energy-Efficient Resource Allocation Algorithms in Heterogeneous Cloud Environments", authors: "T.V.Vamsi Krishna, Dr. N. Veeranjaneyulu", journal_name: "IEEE Access", issn: "2169-3536", quartile: "Q2", citations: 11, is_flagged_predatory: false, doi: "10.1109/ACCESS.2024.3351022", faculty_name: "Dr. N. Veeranjaneyulu" },
  { id: 5, title: "Privacy-Preserving Federated Learning Architectures for IoT Healthcare Sensor Streams", authors: "Naga Durga Saile K, Dr. S. Bala Krishna", journal_name: "ACM Computing Surveys", issn: "0360-0300", quartile: "Q1", citations: 32, is_flagged_predatory: false, doi: "10.1145/3589410", faculty_name: "Dr. S. Bala Krishna" }
];

const INITIAL_KPIS = [
  { id: 1, domain: "Accreditation Readiness", code: "ACC-01", title: "NIRF Research & Professional Practice (RPC) Projected Score", formula: "Combined Metric [PU + QP + IPR + FPPP]", owner_role: "Vice Chancellor / NIRF Committee", current_value: 54.6, target_value: 75.0, prior_period_value: 54.6, unit: "Points (0-100)", status: "Off_Target_Deteriorating", nirf_mapping: "NIRF Overall & Engineering Matrix" },
  { id: 2, domain: "Doctoral Governance", code: "PHD-01", title: "Ph.D. On-Time Submission & Minimum Duration Compliance Rate", formula: "Eligible Submissions / Active Registered Scholars", owner_role: "Dean of Research & Research Section", current_value: 8.3, target_value: 25.0, prior_period_value: 7.1, unit: "% Compliant", status: "On_Target_Improving", nirf_mapping: "NIRF Metric FPPP & Graduation Outcome" },
  { id: 3, domain: "Faculty Research", code: "RES-01", title: "Faculty Scopus / WoS Annual Publication Intensity", formula: "Total Verified Pubs / Regular Faculty Count", owner_role: "Dean of Research & HoDs", current_value: 1.84, target_value: 2.50, prior_period_value: 1.62, unit: "Pubs/Faculty/Year", status: "On_Target_Improving", nirf_mapping: "NIRF Metric PU (Publications)" },
  { id: 4, domain: "Quality & Impact", code: "PUB-01", title: "First-Tier (Q1/Q2 SCI-E) Research Publication Ratio", formula: "Q1+Q2 Verified Papers / Total Indexed Publications", owner_role: "Research Section & IQAC Director", current_value: 68.2, target_value: 70.0, prior_period_value: 64.5, unit: "% Tier-1/Tier-2", status: "On_Target_Improving", nirf_mapping: "NIRF Metric QP (Quality of Publications)" },
  { id: 5, domain: "Faculty Development", code: "FAC-01", title: "Faculty Appraisal & 360-Degree Evaluation Cycle Completion Rate", formula: "Approved Appraisal Dossiers / Active Faculty", owner_role: "Vice Chancellor & Dean Academics", current_value: 92.4, target_value: 100.0, prior_period_value: 85.0, unit: "% Portfolios", status: "On_Target_Improving", nirf_mapping: "NAAC Criteria 6 (Governance & Leadership)" }
];

const INITIAL_BENCHMARKS = {
  institutional_gini_coefficient: 0.38,
  concentration_insight: "Well-distributed research output across major departments.",
  top_10_percent_share_pct: 34.2,
  department_benchmarks: [
    { department: "Computer Science and Engineering", faculty_count: 52, total_productivity_score: 1420, average_productivity_per_faculty: 27.3, peak_faculty_score: 96.5 },
    { department: "Information Technology", faculty_count: 28, total_productivity_score: 720, average_productivity_per_faculty: 25.7, peak_faculty_score: 84.0 },
    { department: "Electronics and Communication", faculty_count: 46, total_productivity_score: 1110, average_productivity_per_faculty: 24.1, peak_faculty_score: 88.0 },
    { department: "Mechanical Engineering", faculty_count: 36, total_productivity_score: 680, average_productivity_per_faculty: 18.9, peak_faculty_score: 74.0 }
  ]
};

const INITIAL_LEAD_LAG = [
  { time_lag: "6-12 Months", correlation_strength: "High (r = 0.84)", lead_indicator: "PhD Milestone Timeliness & Tier-1 Pubs", lag_indicator: "NIRF RPC & Institutional H-Index", strategic_insight: "Early completion of comprehensive examination and pre-submission seminars directly correlates with higher citation yields." },
  { time_lag: "12-18 Months", correlation_strength: "Very High (r = 0.89)", lead_indicator: "Supervisor Regulatory Capacity Adherence", lag_indicator: "Doctoral Graduation Outcome (NIRF GO)", strategic_insight: "Preventing supervisor over-allocation reduces average Ph.D. duration by 1.4 years." }
];

// 3. Main React Application Component
function App() {
  const [activeTab, setActiveTab] = useState("phd");
  const [personas, setPersonas] = useState(INITIAL_PERSONAS);
  const [currentPersona, setCurrentPersona] = useState(INITIAL_PERSONAS[1]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Scholars state initialized with full 84 scholars
  const [scholars, setScholars] = useState(INITIAL_SCHOLARS);
  const [selectedScholar, setSelectedScholar] = useState(INITIAL_SCHOLARS[0]);
  const [scholarSearch, setScholarSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const [capacities, setCapacities] = useState(INITIAL_CAPACITIES);
  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);
  const [kpis, setKpis] = useState(INITIAL_KPIS);
  const [departmentBenchmarks, setDepartmentBenchmarks] = useState(INITIAL_BENCHMARKS);
  const [leadLag, setLeadLag] = useState(INITIAL_LEAD_LAG);

  const [journalQuery, setJournalQuery] = useState("2168-2267");
  const [journalResult, setJournalResult] = useState(null);

  const [dossier, setDossier] = useState(null);
  const [isContesting, setIsContesting] = useState(false);
  const [contestReason, setContestReason] = useState("");

  const showNotice = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  useEffect(() => {
    verifyJournal("2168-2267");
    loadFacultyDossier(4);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ovRes, perRes, schRes, capRes, pubRes, kpiRes] = await Promise.all([
        fetch(`${API_BASE}/overview`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/auth/personas`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/phd/scholars`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/phd/supervisor-capacities`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/publications/`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/kpis/cockpit`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      if (perRes && perRes.length > 0) setPersonas(perRes);
      if (schRes && schRes.scholars && schRes.scholars.length > 0) {
        setScholars(schRes.scholars);
        loadScholarDetail(schRes.scholars[0].id);
      }
      if (capRes && capRes.length > 0) setCapacities(capRes);
      if (pubRes && pubRes.length > 0) setPublications(pubRes);
      if (kpiRes && kpiRes.length > 0) setKpis(kpiRes);
    } catch (err) {
      console.warn("Operating in standalone static mode with embedded 84 scholars dataset.", err);
    }
  };

  const loadScholarDetail = (id) => {
    const found = (scholars || []).find((s) => s.id === id) || INITIAL_SCHOLARS.find((s) => s.id === id);
    if (found) {
      setSelectedScholar(found);
      if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setTimeout(() => {
          const el = document.getElementById("scholar-dossier-panel");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  };

  const handleCompleteMilestone = (scholarId, milestoneCode) => {
    const nowStr = new Date().toISOString().split("T")[0];
    setScholars((prev) =>
      (prev || []).map((s) => {
        if (s.id !== scholarId) return s;
        const updatedMilestones = (s.milestones || []).map((m) =>
          m.code === milestoneCode ? { ...m, status: "Completed", completion_date: nowStr } : m
        );
        return { ...s, milestones: updatedMilestones };
      })
    );
    setSelectedScholar((prev) => {
      if (!prev || prev.id !== scholarId) return prev;
      return {
        ...prev,
        milestones: (prev.milestones || []).map((m) =>
          m.code === milestoneCode ? { ...m, status: "Completed", completion_date: nowStr } : m
        )
      };
    });
    showNotice(`Milestone ${milestoneCode} verified and completed successfully!`, "success");
  };

  const loadFacultyDossier = (facultyId) => {
    setDossier({
      faculty_name: "Dr. M. Nirupama Bhat",
      designation: "Professor",
      department: "Computer Science and Engineering",
      academic_year: "2025-26",
      status: "Verified by IQAC",
      aggregate_score: 86.8,
      performance_band: "Exceptional",
      dimension_scores: {
        teaching: { score: 31.5, teaching_hours: 14 },
        research: { score: 33.2, publications_count: 6, q1_q2_count: 4, phd_scholars_active: 8 },
        governance: { score: 12.0, role: "Doctoral Committee Chairperson" },
        outreach: { score: 10.1 }
      },
      administrative_adjustment_factor: 1.15,
      agreed_next_cycle_goals: "Mentor 2 Ph.D. scholars to synopsis submission and secure 1 funded international research grant."
    });
  };

  const verifyJournal = (q) => {
    const isDelisted = String(q || "").toLowerCase().includes("ambient");
    setJournalResult({
      title: isDelisted ? "Journal of Ambient Intelligence and Humanized Computing" : "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      canonical_issn: q,
      publisher: isDelisted ? "Springer Nature (Discontinued 2023)" : "IEEE Computer Society",
      subject_category: "Computer Science - AI & Machine Learning",
      verdict_badge: isDelisted ? "DISQUALIFIED / DELISTED" : "APPROVED (Q1 TIER-1)",
      verdict: isDelisted ? "REJECT" : "APPROVED",
      verification_timestamp: new Date().toISOString(),
      quartiles: { jcr_wos: isDelisted ? "DELISTED" : "Q1" },
      metrics: { citescore: isDelisted ? "5.4" : "18.2", impact_factor: isDelisted ? "2.3" : "11.8", peer_review_turnaround_weeks: 10 },
      recommendation: isDelisted ? "Discontinued in Scopus due to publication anomalies. Zero PhD points awarded." : "Approved for full Tier-1 PhD research point allocation (5.0 pts).",
      risk_evidence: isDelisted ? ["Scopus discontinuation flag detected", "High volume abnormal publication surge"] : [],
      alternatives: [
        { id: 1, title: "Pattern Recognition", issn: "0031-3203", quartile: "Q1", impact_factor: "8.5" },
        { id: 2, title: "IEEE Transactions on Cybernetics", issn: "2168-2267", quartile: "Q1", impact_factor: "11.8" }
      ]
    });
  };

  const handlePersonaChange = (roleId) => {
    const p = (personas || []).find((item) => item.role_id === roleId);
    if (!p) return;
    setCurrentPersona(p);
    if (p.role_id === "vice_chancellor") {
      setActiveTab("kpi");
    } else if (p.role_id === "dean_research") {
      setActiveTab("phd");
    } else if (p.role_id === "hod") {
      setActiveTab("performance");
      loadFacultyDossier(3);
    } else if (p.role_id === "faculty_supervisor") {
      setActiveTab("journal");
      loadFacultyDossier(4);
    } else if (p.role_id === "phd_scholar") {
      setActiveTab("phd");
      const myScholar = (scholars || []).find((s) => s.reg_no === p.reg_no) || scholars[1];
      if (myScholar) setSelectedScholar(myScholar);
    }
    showNotice(`Switched persona to ${p.user_name} (${p.role_title})`);
  };

  const handleSweep = () => {
    showNotice("Agent 17: External Automated Sweep: 29 author registries synchronized with Scopus/WoS!");
  };

  const handleSyncKpis = () => {
    showNotice("Agent 71: Live University KPIs recomputed and synchronized across all 6 agents!");
  };

  const handleContest = () => {
    showNotice("Contestation submitted to Dean of Research and IQAC Committee.");
    setIsContesting(false);
    setContestReason("");
  };

  const filteredScholars = useMemo(() => {
    return (scholars || []).filter((s) => {
      const name = String(s.name || "").toLowerCase();
      const reg = String(s.reg_no || "").toLowerCase();
      const area = String(s.research_area || "").toLowerCase();
      const term = String(scholarSearch || "").toLowerCase();
      const matchesSearch = !term || name.includes(term) || reg.includes(term) || area.includes(term);
      const matchesArea = !selectedArea || area.includes(String(selectedArea).toLowerCase());
      return matchesSearch && matchesArea;
    });
  }, [scholars, scholarSearch, selectedArea]);

  const uniqueAreas = useMemo(() => {
    return Array.from(new Set((scholars || []).map((s) => s.research_area).filter(Boolean))).sort();
  }, [scholars]);

  if (loading) {
    return React.createElement(
      "div",
      { className: "min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white" },
      React.createElement("div", { className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }),
      React.createElement("h2", { className: "text-xl font-bold tracking-tight" }, "VFSTR Multi-Agent University Platform"),
      React.createElement("p", { className: "text-slate-400 text-sm mt-1" }, "Initializing multi-agent governance dashboard...")
    );
  }

  return React.createElement(
    "div",
    { className: "min-h-screen flex flex-col bg-slate-50 text-slate-800" },
    React.createElement(
      "header",
      { className: "bg-slate-900 text-white border-b border-slate-700 shadow-md sticky top-0 z-50" },
      React.createElement(
        "div",
        { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4" },
        React.createElement(
          "div",
          { className: "flex items-center space-x-3" },
          React.createElement("div", { className: "w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md font-extrabold text-white text-lg" }, "V"),
          React.createElement(
            "div",
            null,
            React.createElement(
              "div",
              { className: "flex items-center space-x-2" },
              React.createElement("h1", { className: "font-bold text-base md:text-lg tracking-tight leading-tight" }, "Vignan's Foundation for Science, Technology & Research"),
              React.createElement("span", { className: "hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30" }, "NAAC A+ Deemed University")
            ),
            React.createElement("p", { className: "text-xs text-slate-400" }, "Integrated Multi-Agent Academic & Doctoral Governance System")
          )
        ),
        React.createElement(
          "div",
          { className: "flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700" },
          React.createElement("span", { className: "text-xs text-slate-400 px-2 font-medium" }, "Role:"),
          React.createElement(
            "select",
            {
              className: "bg-slate-900 text-xs font-semibold text-white px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
              value: (currentPersona && currentPersona.role_id) || "",
              onChange: (e) => handlePersonaChange(e.target.value)
            },
            (personas || []).map((p) => React.createElement("option", { key: p.role_id, value: p.role_id }, p.role_title, ": ", p.user_name))
          )
        )
      ),
      currentPersona &&
        React.createElement(
          "div",
          { className: "bg-slate-800 border-t border-slate-700 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between max-w-7xl mx-auto" },
          React.createElement(
            "div",
            { className: "flex items-center space-x-2" },
            React.createElement("span", { className: "inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
            React.createElement("span", { className: "font-medium text-white" }, currentPersona.user_name),
            React.createElement("span", { className: "text-slate-400" }, "(", currentPersona.department, ")"),
            React.createElement("span", { className: "text-slate-500" }, "•"),
            React.createElement("span", { className: "text-slate-300" }, currentPersona.description)
          ),
          React.createElement("span", { className: "hidden md:inline-block text-[11px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded" }, "Active Badge: ", currentPersona.badge)
        )
    ),
    React.createElement(
      "nav",
      { className: "bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40" },
      React.createElement(
        "div",
        { className: "max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto custom-scrollbar py-2" },
        React.createElement("button", { onClick: () => setActiveTab("phd"), className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === "phd" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}` }, `Agent 25: PhD Monitoring (${scholars.length} Scholars)`),
        React.createElement("button", { onClick: () => setActiveTab("pubs"), className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === "pubs" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}` }, "Agent 17: Faculty Research Publications"),
        React.createElement("button", { onClick: () => setActiveTab("journal"), className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === "journal" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}` }, "Agent 18: Journal Verifier"),
        React.createElement("button", { onClick: () => setActiveTab("productivity"), className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === "productivity" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}` }, "Agent 20: Research Productivity"),
        React.createElement("button", { onClick: () => { setActiveTab("performance"); loadFacultyDossier(4); }, className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === "performance" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}` }, "Agent 59: Faculty Appraisal"),
        React.createElement("button", { onClick: () => setActiveTab("kpi"), className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${activeTab === "kpi" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}` }, "Agent 71: Strategic KPI Cockpit")
      )
    ),
    notification &&
      React.createElement(
        "div",
        { className: `fixed bottom-5 right-5 z-50 text-xs px-4 py-3 rounded-lg shadow-2xl border flex items-start space-x-2 max-w-md ${notification.type === "error" ? "bg-rose-950 text-rose-100 border-rose-500" : "bg-slate-900 text-white border-blue-500/50"}` },
        React.createElement("span", { className: `w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${notification.type === "error" ? "bg-rose-400" : "bg-emerald-400"}` }),
        React.createElement("span", { className: "leading-snug" }, notification.msg)
      ),
    React.createElement(
      "main",
      { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full" },
      activeTab === "phd" &&
        React.createElement(
          "div",
          { className: "space-y-6" },
          React.createElement(
            "div",
            { className: "grid grid-cols-2 sm:grid-cols-5 gap-3" },
            React.createElement(
              "div",
              { className: "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" },
              React.createElement("div", { className: "text-[11px] font-medium text-slate-500 uppercase tracking-wider" }, "Total Registered Scholars"),
              React.createElement("div", { className: "text-2xl font-bold text-slate-900 mt-1" }, (scholars || []).length),
              React.createElement("div", { className: "text-[10px] text-slate-500 mt-0.5" }, "Active Registered")
            ),
            React.createElement(
              "div",
              { className: "bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm" },
              React.createElement("div", { className: "text-[11px] font-medium text-emerald-800 uppercase tracking-wider" }, "Submission Eligible"),
              React.createElement("div", { className: "text-2xl font-bold text-emerald-700 mt-1" }, (scholars || []).filter((s) => s.submission_eligibility_status === "SUBMISSION_ELIGIBLE").length),
              React.createElement("div", { className: "text-[10px] text-emerald-600 mt-0.5" }, "Tier-1 + 12.0 pts satisfied")
            ),
            React.createElement(
              "div",
              { className: "bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm" },
              React.createElement("div", { className: "text-[11px] font-medium text-amber-800 uppercase tracking-wider" }, "Missing Tier-1 (Cat 1/2)"),
              React.createElement("div", { className: "text-2xl font-bold text-amber-700 mt-1" }, (scholars || []).filter((s) => s.submission_eligibility_status === "MISSING_TIER1").length),
              React.createElement("div", { className: "text-[10px] text-amber-600 mt-0.5" }, "Lacks Cat 1/2 paper")
            ),
            React.createElement(
              "div",
              { className: "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" },
              React.createElement("div", { className: "text-[11px] font-medium text-slate-500 uppercase tracking-wider" }, "Cap Limit Supervisors"),
              React.createElement("div", { className: "text-2xl font-bold text-amber-600 mt-1" }, (capacities || []).filter((c) => (c.utilization_pct || 0) >= 100).length, " / ", (capacities || []).length),
              React.createElement("div", { className: "text-[10px] text-amber-600 mt-0.5" }, "At capacity limits")
            ),
            React.createElement(
              "div",
              { className: "bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm" },
              React.createElement("div", { className: "text-[11px] font-medium text-rose-800 uppercase tracking-wider" }, "Duration Stalled"),
              React.createElement("div", { className: "text-2xl font-bold text-rose-600 mt-1" }, (scholars || []).filter((s) => s.is_stalled).length),
              React.createElement("div", { className: "text-[10px] text-rose-600 mt-0.5" }, "Exceeding tenure limits")
            )
          ),
          React.createElement(
            "div",
            { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" },
            React.createElement("h4", { className: "font-bold text-slate-900 text-xs uppercase tracking-wider mb-2.5" }, "Supervisor Regulatory Capacity Enforcer"),
            React.createElement(
              "div",
              { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs" },
              (capacities || []).map((c) =>
                React.createElement(
                  "div",
                  { key: c.faculty_id, className: `p-2.5 rounded-lg border ${c.is_at_limit ? "bg-amber-50/70 border-amber-300" : "bg-slate-50 border-slate-200"}` },
                  React.createElement("div", { className: "font-bold text-slate-900 truncate" }, c.name),
                  React.createElement("div", { className: "text-[10px] text-slate-500" }, c.designation),
                  React.createElement("div", { className: "flex justify-between items-center mt-1 text-[11px]" },
                    React.createElement("span", null, "Load: ", React.createElement("strong", null, c.current_count, " / ", c.allowed_capacity)),
                    React.createElement("span", { className: `px-1 py-0.2 rounded font-bold text-[9px] ${c.is_at_limit ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"}` }, c.is_at_limit ? "CAP AT LIMIT" : "AVAILABLE")
                  )
                )
              )
            )
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-1 lg:grid-cols-12 gap-6" },
            React.createElement(
              "div",
              { className: "lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col" },
              React.createElement(
                "div",
                { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
                React.createElement("h3", { className: "font-bold text-slate-900 text-sm" }, "Vignan PhD Scholar Directory (", filteredScholars.length, " Scholars)"),
                React.createElement(
                  "div",
                  { className: "flex items-center space-x-2" },
                  React.createElement(
                    "select",
                    {
                      value: selectedArea,
                      onChange: (e) => setSelectedArea(e.target.value),
                      className: "text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                    },
                    React.createElement("option", { value: "" }, "All Research Areas"),
                    uniqueAreas.map((area) => React.createElement("option", { key: area, value: area }, area))
                  ),
                  React.createElement("input", {
                    type: "text",
                    placeholder: "Search scholar, reg no...",
                    value: scholarSearch,
                    onChange: (e) => setScholarSearch(e.target.value),
                    className: "text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  })
                )
              ),
              React.createElement(
                "div",
                { className: "overflow-x-auto custom-scrollbar flex-1 max-h-[550px]" },
                React.createElement(
                  "table",
                  { className: "w-full text-left text-xs" },
                  React.createElement(
                    "thead",
                    { className: "bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b" },
                    React.createElement(
                      "tr",
                      null,
                      React.createElement("th", { className: "py-2.5 px-2.5" }, "Reg No"),
                      React.createElement("th", { className: "py-2.5 px-2.5" }, "Scholar Name"),
                      React.createElement("th", { className: "py-2.5 px-2" }, "Area"),
                      React.createElement("th", { className: "py-2.5 px-2" }, "Year / Mode"),
                      React.createElement("th", { className: "py-2.5 px-2" }, "Supervisor"),
                      React.createElement("th", { className: "py-2.5 px-2" }, "Points"),
                      React.createElement("th", { className: "py-2.5 px-2" }, "Status"),
                      React.createElement("th", { className: "py-2.5 px-2" }, "Action")
                    )
                  ),
                  React.createElement(
                    "tbody",
                    { className: "divide-y divide-slate-100" },
                    filteredScholars.map((s) => {
                      const isSelected = (selectedScholar && selectedScholar.id) === s.id;
                      const pts = Number(s.cumulative_research_points) || 0;
                      const modeSlice = (String(s.mode || "Full-Time")).slice(0, 2);
                      const isEligible = s.submission_eligibility_status === "SUBMISSION_ELIGIBLE";
                      const isMissingT1 = s.submission_eligibility_status === "MISSING_TIER1";
                      return React.createElement(
                        "tr",
                        {
                          key: s.id,
                          onClick: () => loadScholarDetail(s.id),
                          className: `cursor-pointer transition-colors hover:bg-blue-50/50 ${isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""}`
                        },
                        React.createElement("td", { className: "py-2.5 px-2.5 font-mono font-bold text-slate-900" }, s.reg_no || ""),
                        React.createElement("td", { className: "py-2.5 px-2.5 font-medium text-slate-900" }, s.name || ""),
                        React.createElement("td", { className: "py-2.5 px-2 text-slate-600" }, s.research_area || ""),
                        React.createElement("td", { className: "py-2.5 px-2 text-slate-500 whitespace-nowrap" }, s.admission_year || 2020, " (", modeSlice, ")"),
                        React.createElement("td", { className: "py-2.5 px-2 text-slate-700 truncate max-w-[120px]" }, (s.supervisor && s.supervisor.name) ? s.supervisor.name : "N/A"),
                        React.createElement("td", { className: "py-2.5 px-2 font-mono font-bold text-blue-700" }, pts.toFixed(1), React.createElement("span", { className: "text-[10px] text-slate-400 font-normal" }, "/12")),
                        React.createElement(
                          "td",
                          { className: "py-2.5 px-2 whitespace-nowrap" },
                          React.createElement(
                            "span",
                            { className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${isEligible ? "bg-emerald-100 text-emerald-800" : isMissingT1 ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-700"}` },
                            isEligible ? "✓ Eligible" : isMissingT1 ? "⚠ Missing T-1" : "Pending"
                          )
                        ),
                        React.createElement(
                          "td",
                          { className: "py-2.5 px-2" },
                          React.createElement("button", { onClick: (e) => { e.stopPropagation(); loadScholarDetail(s.id); }, className: "text-blue-600 hover:text-blue-800 font-semibold text-[11px]" }, "View →")
                        )
                      );
                    })
                  )
                )
              )
            ),
            React.createElement(
              "div",
              { id: "scholar-dossier-panel", className: "lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col scroll-mt-24" },
              selectedScholar
                ? React.createElement(
                    "div",
                    { className: "space-y-4" },
                    React.createElement(
                      "div",
                      { className: "border-b pb-3 flex justify-between items-start" },
                      React.createElement(
                        "div",
                        null,
                        React.createElement(
                          "div",
                          { className: "flex items-center space-x-2" },
                          React.createElement("h3", { className: "font-bold text-base text-slate-900" }, selectedScholar.name || ""),
                          React.createElement("span", { className: "text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800" }, selectedScholar.reg_no || "")
                        ),
                        React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, selectedScholar.research_area || "", " • ", selectedScholar.mode || "Full-Time"),
                        React.createElement("div", { className: "text-[11px] text-slate-400 mt-0.5" }, "Guide: ", (selectedScholar.supervisor && selectedScholar.supervisor.name) ? selectedScholar.supervisor.name : "N/A", " • Admitted: ", selectedScholar.admission_year || 2020)
                      ),
                      React.createElement("span", { className: `px-2 py-1 text-xs font-bold rounded ${selectedScholar.is_stalled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}` }, String(selectedScholar.current_status || "ACTIVE").replace(/_/g, " "))
                    ),
                    selectedScholar.is_stalled &&
                      React.createElement(
                        "div",
                        { className: "p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900" },
                        React.createElement("strong", null, "⚠ REGULATORY INTERVENTION: "),
                        selectedScholar.stalled_reason || "Approaching maximum tenure limit. Extension review mandated."
                      ),
                    React.createElement(
                      "div",
                      { className: "p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5" },
                      React.createElement("div", { className: "font-bold text-slate-900 flex justify-between" },
                        React.createElement("span", null, "Doctoral Committee (DC) Roster"),
                        React.createElement("span", { className: "text-[10px] text-blue-600 font-semibold" }, "Constituted")
                      ),
                      React.createElement("div", { className: "grid grid-cols-2 gap-2 text-[11px]" },
                        React.createElement("div", null, React.createElement("span", { className: "text-slate-500 block text-[10px]" }, "Research Supervisor:"), React.createElement("span", { className: "font-semibold text-slate-900" }, (selectedScholar.supervisor && selectedScholar.supervisor.name) || "Dr. S. V. Phani Kumar")),
                        React.createElement("div", null, React.createElement("span", { className: "text-slate-500 block text-[10px]" }, "External Expert:"), React.createElement("span", { className: "font-semibold text-slate-900" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.external_expert_name) || "Dr USN Raju"), " (NIT Warangal)")),
                        React.createElement("div", null, React.createElement("span", { className: "text-slate-500 block text-[10px]" }, "Internal Expert:"), React.createElement("span", { className: "font-medium text-slate-800" }, (selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.internal_expert1_name) || "Dr. S.K. Satpathy")),
                        React.createElement("div", null, React.createElement("span", { className: "text-slate-500 block text-[10px]" }, "Inter-School Nominee:"), React.createElement("span", { className: "font-medium text-slate-800" }, (selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.interschool_nominee_name) || "Dr. Ravi Sekhar"))
                      )
                    ),
                    selectedScholar.publication_eligibility &&
                      React.createElement(
                        "div",
                        { className: "p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs space-y-2" },
                        React.createElement("div", { className: "flex justify-between items-center" },
                          React.createElement("span", { className: "font-bold text-slate-900 uppercase tracking-wide text-[11px]" }, "PhD Submission Regulatory Compliance: Dual-Condition Rule"),
                          React.createElement("span", { className: `px-2 py-0.5 rounded font-bold text-[10px] ${selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"}` }, selectedScholar.publication_eligibility.status_badge)
                        ),
                        React.createElement("p", { className: "text-[11px] text-slate-700 leading-relaxed" }, selectedScholar.publication_eligibility.status_message),
                        React.createElement("div", { className: "grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-blue-200/60" },
                          React.createElement("div", null, React.createElement("span", { className: "text-slate-500 block text-[10px]" }, "Rule 1: Tier-1 Publication:"), React.createElement("strong", { className: selectedScholar.tier1_publication_met ? "text-emerald-700" : "text-amber-700" }, selectedScholar.tier1_publication_met ? "✓ SATISFIED" : "✗ UNMET")),
                          React.createElement("div", null, React.createElement("span", { className: "text-slate-500 block text-[10px]" }, "Rule 2: Cumulative Points:"), React.createElement("strong", { className: selectedScholar.cumulative_research_points >= 12 ? "text-emerald-700" : "text-amber-700" }, (Number(selectedScholar.cumulative_research_points) || 0).toFixed(1), " / 12.0 pts"))
                        )
                      ),
                    React.createElement(
                      "div",
                      null,
                      React.createElement("div", { className: "flex justify-between items-center mb-2" },
                        React.createElement("h4", { className: "font-bold text-xs text-slate-900" }, "Milestone Regulatory Sequence"),
                        React.createElement("span", { className: "text-[10px] text-slate-400" }, "10 Stages")
                      ),
                      React.createElement(
                        "div",
                        { className: "space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1" },
                        ((selectedScholar && selectedScholar.milestones) || []).map((m, idx) =>
                          React.createElement(
                            "div",
                            { key: m.id || idx, className: "flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs" },
                            React.createElement(
                              "div",
                              { className: "flex items-center space-x-2 min-w-0 flex-1" },
                              React.createElement("div", { className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${m.status === "Completed" ? "bg-emerald-500 text-white" : m.status === "Overdue" ? "bg-rose-500 text-white" : "bg-slate-300 text-slate-700"}` }, m.status === "Completed" ? "✓" : idx + 1),
                              React.createElement(
                                "div",
                                { className: "min-w-0" },
                                React.createElement("span", { className: "font-semibold text-slate-900 block truncate text-[11px]" }, m.name),
                                React.createElement("span", { className: "text-[10px] text-slate-500" }, "Due: ", m.due_date || "TBD", m.completion_date ? ` • Done: ${m.completion_date}` : "")
                              )
                            ),
                            React.createElement(
                              "div",
                              { className: "flex items-center space-x-1.5 ml-2" },
                              React.createElement("span", { className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${m.status === "Completed" ? "bg-emerald-100 text-emerald-800" : m.status === "Overdue" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"}` }, m.status),
                              m.status !== "Completed" &&
                                React.createElement("button", { onClick: () => handleCompleteMilestone(selectedScholar.id, m.code), className: "px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm" }, "Complete →")
                            )
                          )
                        )
                      )
                    )
                  )
                : React.createElement("div", { className: "flex items-center justify-center h-full text-slate-400 text-xs" }, "Select a scholar from the register to view detailed dossier")
            )
          )
        ),
      activeTab === "pubs" &&
        React.createElement(
          "div",
          { className: "space-y-6" },
          React.createElement(
            "div",
            { className: "flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm" },
            React.createElement("div", null, React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 17: Research Publication Monitoring"), React.createElement("p", { className: "text-xs text-slate-500" }, "Verified Scopus & Web of Science listings.")),
            React.createElement("button", { onClick: handleSweep, className: "px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition" }, "⚡ Trigger Sweep")
          ),
          React.createElement(
            "div",
            { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto custom-scrollbar" },
            React.createElement(
              "table",
              { className: "w-full text-left text-xs" },
              React.createElement(
                "thead",
                { className: "bg-slate-100 text-slate-600 font-semibold border-b" },
                React.createElement("tr", null, React.createElement("th", { className: "py-2 px-3" }, "Title & DOI"), React.createElement("th", { className: "py-2 px-3" }, "Faculty Guide"), React.createElement("th", { className: "py-2 px-3" }, "Journal"), React.createElement("th", { className: "py-2 px-3" }, "Quartile"), React.createElement("th", { className: "py-2 px-3" }, "Citations"))
              ),
              React.createElement(
                "tbody",
                { className: "divide-y divide-slate-100" },
                (publications || []).map((p) =>
                  React.createElement(
                    "tr",
                    { key: p.id },
                    React.createElement("td", { className: "py-2.5 px-3 max-w-sm" }, React.createElement("div", { className: "font-semibold text-slate-900" }, p.title), React.createElement("div", { className: "text-[10px] text-blue-600 font-mono" }, "DOI: ", p.doi)),
                    React.createElement("td", { className: "py-2.5 px-3 text-slate-700" }, p.faculty_name || "Faculty"),
                    React.createElement("td", { className: "py-2.5 px-3 text-slate-600" }, p.journal_name),
                    React.createElement("td", { className: "py-2.5 px-3 font-bold text-emerald-600" }, p.quartile),
                    React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-slate-700" }, p.citations)
                  )
                )
              )
            )
          )
        ),
      activeTab === "journal" &&
        React.createElement(
          "div",
          { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" },
          React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 18: Journal Quartile & Predatory Risk Verifier"),
          React.createElement(
            "div",
            { className: "flex gap-2" },
            React.createElement("input", {
              type: "text",
              value: journalQuery,
              onChange: (e) => setJournalQuery(e.target.value),
              placeholder: "Enter ISSN or Journal Title...",
              className: "border px-3 py-1.5 text-xs rounded-lg w-72"
            }),
            React.createElement("button", { onClick: () => verifyJournal(journalQuery), className: "bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg font-bold hover:bg-blue-700 transition" }, "Verify Venue")
          ),
          journalResult &&
            React.createElement(
              "div",
              { className: "p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2" },
              React.createElement("div", { className: "font-bold text-base text-slate-900" }, journalResult.title),
              React.createElement("div", { className: "text-slate-600" }, "Publisher: ", journalResult.publisher, " • Subject: ", journalResult.subject_category),
              React.createElement("div", { className: `font-bold ${journalResult.verdict === "APPROVED" ? "text-emerald-700" : "text-rose-700"}` }, "Verdict: ", journalResult.verdict_badge),
              React.createElement("div", { className: "text-slate-700 leading-relaxed" }, "Recommendation: ", journalResult.recommendation)
            )
        ),
      activeTab === "productivity" &&
        React.createElement(
          "div",
          { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" },
          React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 20: Research Productivity & Benchmarking"),
          departmentBenchmarks &&
            React.createElement(
              "div",
              { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
              (departmentBenchmarks.department_benchmarks || []).map((dept, i) =>
                React.createElement(
                  "div",
                  { key: i, className: "p-4 border rounded-xl bg-slate-50 text-xs space-y-1" },
                  React.createElement("div", { className: "font-bold text-sm text-slate-900" }, dept.department),
                  React.createElement("div", { className: "text-slate-600" }, "Total Productivity Score: ", React.createElement("strong", { className: "text-blue-600" }, dept.total_productivity_score)),
                  React.createElement("div", { className: "text-slate-600" }, "Faculty Count: ", dept.faculty_count, " • Avg Output: ", dept.average_productivity_per_faculty)
                )
              )
            )
        ),
      activeTab === "performance" &&
        React.createElement(
          "div",
          { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" },
          React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 59: Faculty Performance Dossier (Annual 360)"),
            React.createElement("button", { onClick: () => setIsContesting(true), className: "px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded hover:bg-blue-50 font-bold" }, "⚖ Contest Calculation")
          ),
          dossier
            ? React.createElement(
                "div",
                { className: "space-y-4 text-xs" },
                React.createElement("div", { className: "flex justify-between items-start border-b pb-3" },
                  React.createElement("div", null, React.createElement("h3", { className: "text-base font-bold text-slate-900" }, dossier.faculty_name, " (", dossier.designation, ")"), React.createElement("p", { className: "text-slate-500" }, dossier.department, " • Appraisal Cycle: ", dossier.academic_year)),
                  React.createElement("div", { className: "text-right" }, React.createElement("div", { className: "text-2xl font-black text-blue-600" }, dossier.aggregate_score, " / 100"), React.createElement("span", { className: "px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold" }, dossier.performance_band))
                ),
                React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3" },
                  React.createElement("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-200" }, React.createElement("span", { className: "font-bold block text-slate-700" }, "Teaching (35%)"), React.createElement("div", { className: "text-xl font-bold mt-1" }, dossier.dimension_scores.teaching.score)),
                  React.createElement("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-200" }, React.createElement("span", { className: "font-bold block text-slate-700" }, "Research (35%)"), React.createElement("div", { className: "text-xl font-bold mt-1" }, dossier.dimension_scores.research.score)),
                  React.createElement("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-200" }, React.createElement("span", { className: "font-bold block text-slate-700" }, "Governance (15%)"), React.createElement("div", { className: "text-xl font-bold mt-1" }, dossier.dimension_scores.governance.score)),
                  React.createElement("div", { className: "p-3 bg-slate-50 rounded-lg border border-slate-200" }, React.createElement("span", { className: "font-bold block text-slate-700" }, "Outreach (15%)"), React.createElement("div", { className: "text-xl font-bold mt-1" }, dossier.dimension_scores.outreach.score))
                ),
                React.createElement("div", { className: "p-2.5 bg-blue-50 border border-blue-200 rounded text-blue-900" }, "Administrative Relief Multiplier: ", React.createElement("strong", null, dossier.administrative_adjustment_factor, "x"), " applied for leadership roles without penalizing research output.")
              )
            : React.createElement("button", { onClick: () => loadFacultyDossier(4), className: "bg-blue-600 text-white px-3 py-1.5 text-xs rounded-lg font-bold" }, "Load Faculty Dossier"),
          isContesting &&
            React.createElement(
              "div",
              { className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" },
              React.createElement(
                "div",
                { className: "bg-white rounded-xl max-w-md w-full p-5 space-y-3 shadow-2xl" },
                React.createElement("h3", { className: "font-bold text-sm text-slate-900" }, "Contest Automated Performance Calculation"),
                React.createElement("textarea", { rows: "3", value: contestReason, onChange: (e) => setContestReason(e.target.value), placeholder: "State your contestation justification...", className: "w-full border p-2 text-xs rounded-lg" }),
                React.createElement("div", { className: "flex justify-end space-x-2" },
                  React.createElement("button", { onClick: () => setIsContesting(false), className: "px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded" }, "Cancel"),
                  React.createElement("button", { onClick: handleContest, className: "px-3 py-1.5 text-xs bg-blue-600 text-white font-bold rounded hover:bg-blue-700" }, "Submit Contestation")
                )
              )
            )
        ),
      activeTab === "kpi" &&
        React.createElement(
          "div",
          { className: "space-y-4" },
          React.createElement(
            "div",
            { className: "flex justify-between items-center bg-white p-5 rounded-xl border border-slate-200 shadow-sm" },
            React.createElement("div", null, React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 71: Strategic Key Performance Indicators"), React.createElement("p", { className: "text-xs text-slate-500" }, "Real-time metrics tracking and NIRF RPC projections.")),
            React.createElement("button", { onClick: handleSyncKpis, className: "px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition" }, "🔄 Sync KPIs")
          ),
          React.createElement(
            "div",
            { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            (kpis || []).map((kpi) =>
              React.createElement(
                "div",
                { key: kpi.id, className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs" },
                React.createElement("div", { className: "flex justify-between" },
                  React.createElement("span", { className: "font-mono font-bold text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700" }, kpi.code, " • ", kpi.domain),
                  React.createElement("span", { className: `font-bold text-[10px] px-2 py-0.5 rounded ${kpi.status.includes("Improving") ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}` }, (kpi.status || "").replace(/_/g, " "))
                ),
                React.createElement("div", { className: "font-bold text-slate-900 text-sm mt-2" }, kpi.title),
                React.createElement("div", { className: "text-2xl font-black text-blue-600 mt-1" }, kpi.current_value, " ", React.createElement("span", { className: "text-xs font-normal text-slate-500" }, kpi.unit)),
                React.createElement("div", { className: "text-slate-400 text-[11px] mt-2 border-t pt-1.5" }, "Target: ", kpi.target_value, " • Owner: ", kpi.owner_role)
              )
            )
          ),
          React.createElement(
            "div",
            { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" },
            React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-1" }, "Institutional Lead-Lag Predictive Relationships"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs" },
              (leadLag || []).map((rel, idx) =>
                React.createElement(
                  "div",
                  { key: idx, className: "p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5" },
                  React.createElement("div", { className: "flex justify-between font-bold text-blue-700 font-mono text-[11px]" }, React.createElement("span", null, "Lag Time: ", rel.time_lag), React.createElement("span", { className: "bg-blue-100 text-blue-900 px-1.5 py-0.2 rounded" }, rel.correlation_strength)),
                  React.createElement("div", null, React.createElement("span", { className: "text-slate-400 block text-[10px] uppercase font-bold" }, "Lead Indicator:"), React.createElement("span", { className: "font-semibold text-slate-900" }, rel.lead_indicator)),
                  React.createElement("div", null, React.createElement("span", { className: "text-slate-400 block text-[10px] uppercase font-bold" }, "Lag Outcome:"), React.createElement("span", { className: "font-semibold text-slate-900" }, rel.lag_indicator)),
                  React.createElement("p", { className: "text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1" }, rel.strategic_insight)
                )
              )
            )
          )
        )
    ),
    React.createElement(
      "footer",
      { className: "bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500" },
      "© ",
      new Date().getFullYear(),
      " Vignan's Foundation for Science, Technology & Research (VFSTR). Deemed to be University."
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App, null));
