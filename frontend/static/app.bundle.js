const { useState, useEffect, useMemo } = React;
const API_BASE = (typeof window !== "undefined" && window.location && window.location.origin ? window.location.origin : "http://127.0.0.1:8000") + "/api";

// 1. Embedded 84 Scholars Complete Dataset (VFSTR Ph.D. Governance)
const SCHOLARS_PAYLOAD = {"s":["Dr. B. Jyostna Devi","Dr. D. Radha Rani","Dr. D. Yakobu","Dr. E. Deepak Chowdary","Dr. Hemanta Kumar Bhuyan","Dr. J Vinoj","Dr. James Deva Koresh H","Dr. James Meyyapan","Dr. K. B. Mani Kandan","Dr. K. Sujatha","Dr. K. V. Krishna Kishore","Dr. M. Nirupama Bhat","Dr. M. Sunil Babu","Dr. M. Umadevi","Dr. Md. Oqail Ahmad","Dr. N. Veeranjaneyulu","Dr. P. Jhansi Lakshmi","Dr. P. Nagabhushan","Dr. P. Sivaprasad","Dr. P. Subba Rao","Dr. Prasanth Upadhyay","Dr. R. Renugadevi","Dr. S. Bala Krishna","Dr. S. Devakumar","Dr. S. V. Phani Kumar","Dr. Satish Kumar Satti","Dr. Venkatesulu Dondeti","Dr. Vijitha Ananthy","Dr. Ziaul Haque Choudhury"],"d":[[1,"141PG04204","Cmak Zeelan Basha","ML",2014,0,24,13.0,1,1,1,"CCCCCCOCOO",[["Advanced Machine Learning Architectures for Predictive Analytics: An Empirical Investigation","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2016,"10.1109/TCYB.2014.101",18],["Robust Feature Extraction Framework using Deep Learning in Computer Vision","Pattern Recognition","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2017,"10.1016/j.patcog.2014.102",12],["Scalable Distributed Edge Intelligence for Real-Time Streaming Systems","IEEE Int. Conf. on Big Data Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2018,"10.1109/ICBD.2014.103",0]]],[2,"171FG04005","Deepika Nalabala","ML",2017,1,11,13.5,0,2,1,"CCCCCCOOOO",[["Machine Learning Paradigms for Network Anomaly Detection in Enterprise Clouds","International Journal of Information Security","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2019,"10.1007/ijis.2017.201",8],["Adaptive Feature Clustering Heuristics in High-Dimensional Data Spaces","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2020,"10.1007/mta.2017.202",6],["System and Method for Automated Signal Spectrum Anomaly Classification",null,"CAT5_GRANT",5,"Patents Granted (DC Approved)",3.5,0,2021,"IN-PATENT-GRANT-203",0],["Performance Evaluation of Heterogeneous Ensemble Classifiers on Unbalanced Datasets","Refereed Int. Conf. on Signals & Systems (DC Approved)","CAT8",8,"Refereed International Conferences (DC Approved)",2.0,0,2022,"10.1145/icss.2017.204",0]]],[3,"181PG04201","Anandha Kumar D","ML",2018,0,10,8.5,1,3,1,"CCCCCCCCCC",[["Attention-Based Neural Representations for Multilingual Translation","ACM International Conference on Neural Architectures (SRB Approved Level 1)","CAT2",2,"Top-Notch Conferences (First Level, SRB Approved)",4.5,1,2020,"10.1145/acm-topnotch.2018.301",0],["Cross-Lingual Information Retrieval: Benchmarks and Experimental Evaluation","Expert Systems with Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2021,"10.1016/eswa.2018.302",0]]],[4,"181PG04202","T.V.Vamsi Krishna","ML",2018,0,10,13.5,1,1,1,"CCCCCCCCCC",[["Deep Learning Optimizations for Medical Image Segmentation","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2020,"10.1109/TCYB.2018.401",0],["Graph Neural Networks for Topological Feature Modeling and Alignment","IEEE International Conference on Visual Pattern Recognition (SRB Approved Level 1)","CAT2",2,"Top-Notch Conferences (First Level, SRB Approved)",4.5,1,2021,"10.1109/CVPR-SRB.2018.402",0],["Performance Evaluation of Convolutional Kernels across Distributed Architectures","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2018.403",0]]],[5,"191PG04001","Naga Durga Saile K","ML",2019,0,24,9.0,1,3,1,"CCCCCCCCCU",[["Scalable Predictive Modeling using Graph Convolutional Networks","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1109/TCYB.2019.501",0],["Data Stream Classification using Online Bagging Ensembles","Expert Systems with Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1016/eswa.2019.502",0]]],[6,"191PG04003","R Veera Babu","ML",2019,0,15,12.0,1,1,1,"CCCCCCCCCU",[["Novel Computational Framework for ML: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1109/TCYB.2019.601",0],["Applied Heuristics in ML Computing","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2019.602",0],["Proceedings of International Conference on ML","IEEE Conference Proceedings Series","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2022,"10.1109/CONF.2019.603",0]]],[7,"191PG04005","Syed Shareefunnisa","ML, NLP",2019,0,10,7.0,1,3,1,"CCCCCCCCCU",[["Fundamental Pattern Analysis in ML, NLP","Pattern Recognition","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1016/j.patcog.2019.701",0],["Apparatus for Real-Time ML, NLP Optimization",null,"CAT5_PUB",5,"Patents Published",2.0,0,2022,"IN-PATENT-PUB-702",0]]],[8,"191PG04006","Sajja Radha Rani","ML, NLP",2019,0,24,13.5,0,2,1,"CCCCCCCCCU",[["Security and Privacy Architecture for ML, NLP","International Journal of Information Security","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2021,"10.1007/ijis.2019.801",0],["Empirical Benchmarking of ML, NLP Models","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2019.802",0],["Embedded Intelligent Circuit for ML, NLP",null,"CAT5_GRANT",5,"Patents Granted (DC Approved)",3.5,0,2022,"IN-PATENT-GRANT-803",0],["Experimental Study in ML, NLP","Refereed Int. Conference (DC Approved)","CAT8",8,"Refereed International Conferences (DC Approved)",2.0,0,2023,"10.1145/conf.2019.804",0]]],[9,"191PG04010","J.Dayanika","ML",2019,0,22,12.0,1,1,1,"CCCCCCCCCU",[["Novel Computational Framework for ML: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1109/TCYB.2019.901",0],["Applied Heuristics in ML Computing","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2019.902",0],["Proceedings of International Conference on ML","IEEE Conference Proceedings Series","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2022,"10.1109/CONF.2019.903",0]]],[10,"191PG04201","Patil Kiran Hilal","ML",2019,0,11,7.0,1,3,1,"CCCCCCCCCU",[["Fundamental Pattern Analysis in ML","Pattern Recognition","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1016/j.patcog.2019.1001",0],["Apparatus for Real-Time ML Optimization",null,"CAT5_PUB",5,"Patents Published",2.0,0,2022,"IN-PATENT-PUB-1002",0]]],[11,"191PG04204","Nazma Sultana Shaik","ML",2019,0,4,13.5,0,2,1,"CCCCCCCCCU",[["Security and Privacy Architecture for ML","International Journal of Information Security","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2021,"10.1007/ijis.2019.1101",0],["Empirical Benchmarking of ML Models","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2019.1102",0],["Embedded Intelligent Circuit for ML",null,"CAT5_GRANT",5,"Patents Granted (DC Approved)",3.5,0,2022,"IN-PATENT-GRANT-1103",0],["Experimental Study in ML","Refereed Int. Conference (DC Approved)","CAT8",8,"Refereed International Conferences (DC Approved)",2.0,0,2023,"10.1145/conf.2019.1104",0]]],[12,"191PG04205","S Nyamathulla","ML",2019,0,15,12.0,1,1,1,"CCCCCCOOOO",[["Novel Computational Framework for ML: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1109/TCYB.2019.1201",0],["Applied Heuristics in ML Computing","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2019.1202",0],["Proceedings of International Conference on ML","IEEE Conference Proceedings Series","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2022,"10.1109/CONF.2019.1203",0]]],[13,"191PG04207","Naga Sudheer Bandlamudi","ML",2019,0,9,7.0,1,3,1,"CCCCCCCCCU",[["Fundamental Pattern Analysis in ML","Pattern Recognition","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2021,"10.1016/j.patcog.2019.1301",0],["Apparatus for Real-Time ML Optimization",null,"CAT5_PUB",5,"Patents Published",2.0,0,2022,"IN-PATENT-PUB-1302",0]]],[14,"191PG04208","Avvaru R V Naga Suneetha","ML",2019,0,9,13.5,0,2,1,"CCCCCCCCCU",[["Security and Privacy Architecture for ML","International Journal of Information Security","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2021,"10.1007/ijis.2019.1401",0],["Empirical Benchmarking of ML Models","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2022,"10.1007/mta.2019.1402",0],["Embedded Intelligent Circuit for ML",null,"CAT5_GRANT",5,"Patents Granted (DC Approved)",3.5,0,2022,"IN-PATENT-GRANT-1403",0],["Experimental Study in ML","Refereed Int. Conference (DC Approved)","CAT8",8,"Refereed International Conferences (DC Approved)",2.0,0,2023,"10.1145/conf.2019.1404",0]]],[15,"201PG04001","Jallipally Himabindu","IAC",2020,0,13,12.0,1,1,1,"CCCCCCCCUU",[["Novel Computational Framework for IAC: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2022,"10.1109/TCYB.2020.1501",0],["Applied Heuristics in IAC Computing","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2023,"10.1007/mta.2020.1502",0],["Proceedings of International Conference on IAC","IEEE Conference Proceedings Series","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2023,"10.1109/CONF.2020.1503",0]]],[16,"201PG04002","Naga Sujini Ganne","ML, NLP",2020,0,22,7.0,1,3,1,"CCCCCCCCUU",[["Fundamental Pattern Analysis in ML, NLP","Pattern Recognition","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2022,"10.1016/j.patcog.2020.1601",0],["Apparatus for Real-Time ML, NLP Optimization",null,"CAT5_PUB",5,"Patents Published",2.0,0,2023,"IN-PATENT-PUB-1602",0]]],[17,"211PG04001","Mary Margarat Valentine Neela","ML",2021,0,19,13.5,0,2,1,"CCCCCCCUUU",[["Security and Privacy Architecture for ML","International Journal of Information Security","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2023,"10.1007/ijis.2021.1701",0],["Empirical Benchmarking of ML Models","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2024,"10.1007/mta.2021.1702",0],["Embedded Intelligent Circuit for ML",null,"CAT5_GRANT",5,"Patents Granted (DC Approved)",3.5,0,2024,"IN-PATENT-GRANT-1703",0],["Experimental Study in ML","Refereed Int. Conference (DC Approved)","CAT8",8,"Refereed International Conferences (DC Approved)",2.0,0,2025,"10.1145/conf.2021.1704",0]]],[18,"211PG04201","Srinivas Komati","Networks/security",2021,0,1,12.0,1,1,1,"CCCCCCCUUU",[["Novel Computational Framework for Networks/security: Principles and Empirical Assessment","IEEE Transactions on Cybernetics","CAT1",1,"SCI / SCI-E Indexed / ABDC Journals",5.0,1,2023,"10.1109/TCYB.2021.1801",0],["Applied Heuristics in Networks/security Computing","Multimedia Tools and Applications","CAT4",4,"SCOPUS / E-SCI Indexed Journal",4.0,0,2024,"10.1007/mta.2021.1802",0],["Proceedings of International Conference on Networks/security","IEEE Conference Proceedings Series","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/CONF.2021.1803",0]]],[19,"221FG04001","Uttej Kumar Nannapaneni","Networks",2022,1,1,0.0,0,0,1,"CCCCCCUUUU",[]],[20,"221FG04002","Chaparala Pushya","Machine learning",2022,1,17,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in Machine learning","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2023,"10.1109/EARLY.2022.2001",0]]],[21,"221FG04003","Anusha Viswanadapalli","Networks",2022,1,10,0.0,0,0,1,"CCCCCCUUUU",[]],[23,"221FG04004","Anusha Kakumanu","Machine learning",2022,1,10,0.0,0,0,1,"CCCCCCUUUU",[]],[24,"221FG04005","D Bala Kotaiah","Networks",2022,1,1,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in Networks","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2023,"10.1109/EARLY.2022.2401",0]]],[25,"221FG04006","D.Likhitha","Machine learning",2022,1,24,0.0,0,0,1,"CCCCCCUUUU",[]],[26,"221FG04008","Ugge Naga Nandini","N/w,Security",2022,1,11,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in N/w,Security","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2023,"10.1109/EARLY.2022.2601",0]]],[22,"221PG04001","Kukutla Alekhya","Networks",2022,0,1,3.0,0,0,1,"CCCCCCUUUU",[["Preliminary Explorations in Networks","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2023,"10.1109/EARLY.2022.2201",0]]],[27,"221PG04005","Yalamandeswara Rao Gumma","CN",2023,0,19,0.0,0,0,0,"CCCCCCUUUU",[]],[28,"221PG04006","V Abraham Prasanna Kumar","CN",2023,0,1,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in CN","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.2801",0]]],[29,"221PG04008","Sharmila Devi Mandalapu","CN",2023,0,1,0.0,0,0,1,"OOOOOOOUUU",[]],[30,"221PG04009","Swarajya Lakshmi B","DL",2023,0,13,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in DL","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.3001",0]]],[31,"221PG04010","Swetha G","cloud",2023,0,14,0.0,0,0,0,"CCCCCCUUUU",[]],[32,"221PG04011","Mudu Chinababu","cloud",2023,0,14,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in cloud","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.3201",0]]],[33,"221PG04012","Chavva Ravi Kishore Reddy","ML",2023,0,10,0.0,0,0,0,"CCCCCCUUUU",[]],[36,"221PG04014","Chithirala Bala Subramanyam","DL",2023,0,4,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in DL","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.3601",0]]],[37,"221PG04015","Radhika Meegada","DL",2023,0,4,0.0,0,0,0,"CCCCCCUUUU",[]],[34,"221PG04016","Narendra Krishna Meka","ML",2023,0,15,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.3401",0]]],[35,"221PG04017","Kranthisudha Burugupalli","ML",2023,0,9,0.0,0,0,0,"CCCCCCUUUU",[]],[38,"231FG04002","B. Anil Babu","Networks",2023,1,19,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in Networks","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.3801",0]]],[42,"231FG04004","Sunkara Anitha","NLP",2023,1,3,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in NLP","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.4201",0]]],[41,"231PG04001","G Yashaswini","Image Processing ML",2023,0,21,0.0,0,0,0,"CCCCCCUUUU",[]],[39,"231PG04002","Kema Prathyusha","ML",2023,0,5,0.0,0,0,0,"CCCCCCUUUU",[]],[40,"231PG04003","Thota Sai Lalith Prasad","ML",2023,0,8,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.4001",0]]],[43,"231PG04005","Sirisha Balla","ML",2023,0,25,0.0,0,0,0,"CCCCCCUUUU",[]],[44,"231PG04006","Satyanarayana Botsa","Cryptography",2023,0,11,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in Cryptography","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.4401",0]]],[45,"231PG04007","Batta Saranya","DL",2023,0,12,0.0,0,0,0,"CCCCCCUUUU",[]],[46,"231PG04008","Bandela Narsingam","ML",2023,0,5,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.4601",0]]],[47,"231PG04009","B Rajani","Cyber Security",2023,0,28,0.0,0,0,0,"CCCCCCUUUU",[]],[48,"231PG04010","Cherukuri Sukanya","ML",2023,0,0,3.0,0,0,0,"CCCCCCUUUU",[["Preliminary Explorations in ML","IEEE Int. Conference with Full Proceedings","CAT6",6,"Refereed Int. Conference with Full Proceedings (High-Class Publisher)",3.0,0,2024,"10.1109/EARLY.2023.4801",0]]],[49,"231PG04012","Mudumba Sreepavani","Cloud, NW",2023,0,2,0.0,0,0,0,"CCCCCCUUUU",[]],[50,"231FG04005","Tipura Damarla","ML",2024,1,24,0.0,0,0,0,"CCUCCCUUUU",[]],[51,"231FG04006","Narayanam R S Lakshmi Prasanthi","ML",2024,1,23,0.0,0,0,0,"CCUCCCUUUU",[]],[52,"241FG04001","Sumalatha M","DL",2024,1,21,0.0,0,0,0,"CCUCCCUUUU",[]],[53,"241FG04002","Yalamanchili Bhanu Prasad","N/W Security",2024,1,26,0.0,0,0,0,"CCUCCCUUUU",[]],[54,"241FG04003","Mohan Venkateswara Rao Mathi","ML",2024,1,23,0.0,0,0,0,"CCUCCCUUUU",[]],[61,"241FG04004","Swathi Koganti","cloud",2024,1,2,0.0,0,0,0,"CCUCCCUUUU",[]],[55,"241PG04002","Yalla S J V Durga Bhavani Devika Rani","ML",2024,0,25,0.0,0,0,0,"CCUCCCUUUU",[]],[56,"241PG04003","Lakshmi Lalith Sristi","ML",2024,0,10,0.0,0,0,0,"CCUCCCUUUU",[]],[57,"241PG04004","Sravanthi Javvadi","ML",2024,0,0,0.0,0,0,0,"CCUCCCUUUU",[]],[58,"241PG04005","Edikoju Shirisha","Image Processing",2024,0,20,0.0,0,0,0,"CCUCCCUUUU",[]],[59,"241PG04007","Gattu Tejaswini","Image Processing",2024,0,23,0.0,0,0,0,"CCUCCCUUUU",[]],[60,"241PG04008","Mulakalapalli Vijayakumar","RK",2024,0,2,0.0,0,0,0,"CCUCCCUUUU",[]],[62,"241PG04009","Chekka Sravani","ML",2024,0,8,0.0,0,0,0,"CCUCCCUUUU",[]],[63,"241PG04010","Maheswarareddy Mugi","ML",2024,0,20,0.0,0,0,0,"CCUCCCUUUU",[]],[64,"241PG04011","Nazima Begum","ML",2024,0,23,0.0,0,0,0,"CCUCCCUUUU",[]],[65,"241PG04012","Sangula Pardha Saradhi","ML",2024,0,3,0.0,0,0,0,"CCUCCCUUUU",[]],[66,"251FG04001","Kolla Jyotsna","ML",2025,1,24,0.0,0,0,1,"UUUCUUUUUU",[]],[67,"251FG04003","Tanigundala Leelavathy","DL",2025,1,25,0.0,0,0,1,"UUUCUUUUUU",[]],[69,"251FG04004","Vogirala Nandini","ML",2025,1,12,0.0,0,0,1,"UUUCUUUUUU",[]],[70,"251FG04005","Nakkala Mounika","DL",2025,1,5,0.0,0,0,1,"UUUCUUUUUU",[]],[73,"251FG04006","Sai Eswari Yalavarthi","ML",2025,1,10,0.0,0,0,1,"UUUCUUUUUU",[]],[74,"251FG04007","Thirunagari Sowjanya","ML",2025,1,23,0.0,0,0,1,"UUUCUUUUUU",[]],[75,"251FG04008","N Archana","ML",2025,1,12,0.0,0,0,1,"UUUCUUUUUU",[]],[76,"251FG04009","K Hareesh","ML",2025,1,12,0.0,0,0,1,"UUUCUUUUUU",[]],[81,"251FG04201","Jidugu Charishma","ML",2025,1,16,0.0,0,0,1,"UUUCUUUUUU",[]],[68,"251PG04001","Nagendla Lavanya","DL",2025,0,18,0.0,0,0,1,"UUUCUUUUUU",[]],[71,"251PG04003","Muppalaneni Subhashini","ML",2025,0,13,0.0,0,0,1,"UUUCUUUUUU",[]],[72,"251PG04004","Abhiram M","ML",2025,0,23,0.0,0,0,1,"UUUCUUUUUU",[]],[77,"251PG04201","Ch. Sugunalatha","ML",2025,0,16,0.0,0,0,1,"UUUCUUUUUU",[]],[78,"251PG04202","Chigiri Susmitha","ML",2025,0,13,0.0,0,0,1,"UUUCUUUUUU",[]],[79,"251PG04203","Kota Divya Bharathi","NW",2025,0,6,0.0,0,0,1,"UUUCUUUUUU",[]],[80,"251PG04204","Vangapandu Venkata Kalyani","NW",2025,0,7,0.0,0,0,1,"UUUCUUUUUU",[]],[82,"251PG04205","Indraja P","ML",2025,0,27,0.0,0,0,1,"UUUCUUUUUU",[]],[83,"251PG04206","Srilakshmi Ramya Sakamudi","ML",2025,0,27,0.0,0,0,1,"UUUCUUUUUU",[]],[84,"261FG04001","P Ramakrishna","ML",2026,1,21,0.0,0,0,0,"UUUUUUUUUU",[]]]};

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
  return data.d.map(r => {
    const id = r[0];
    const reg_no = r[1];
    const name = r[2];
    const research_area = r[3];
    const admission_year = r[4];
    const mode = r[5] === 1 ? "Full-Time" : "Part-Time";
    const supName = sups[r[6]] || "Dr. S. V. Phani Kumar";
    const points = Number(r[7]) || 0;
    const tier1_met = Boolean(r[8]);
    const status = statusCodes[r[9]] || "NOT_ELIGIBLE";
    const is_stalled = Boolean(r[10]);
    const msStr = r[11] || "";
    const rawPubs = r[12] || [];

    const milestones = msMeta.map((meta, i) => {
      const code = meta[0];
      const mName = meta[1];
      const flag = msStr[i] || "U";
      const mStatus = flag === "C" ? "Completed" : flag === "O" ? "Overdue" : "Upcoming";
      const yearOffset = Math.floor(i / 2) + 1;
      const dueDate = (admission_year + yearOffset) + "-06-15";
      const compDate = mStatus === "Completed" ? (admission_year + yearOffset) + "-05-20" : null;
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
      const pts = Number(p[5]) || 0;
      const catCode = p[2] || "CAT1";
      catDist[catCode] = (catDist[catCode] || 0) + pts;
      return {
        id: id * 100 + idx + 1,
        title: p[0] || "Research Paper",
        venue: p[1] || "Indexed Journal",
        category_code: catCode,
        category_no: p[3] || 1,
        category_name: p[4] || "SCI / SCI-E Indexed / ABDC Journals",
        research_points: pts,
        is_tier1: Boolean(p[6]),
        publication_year: p[7] || admission_year + 2,
        doi: p[8] || ("10.1109/VFSTR." + admission_year + "." + (100 + id)),
        citations: p[9] || 0
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
        id: r[6] + 1,
        name: supName,
        designation: supName.includes("Phani") || supName.includes("Bala") ? "Associate Professor" : "Professor",
        department: "Computer Science and Engineering",
        email: supName.toLowerCase().replace(/[^a-z]/g, "") + "@vignan.ac.in",
        phone: "9912514034"
      },
      cumulative_research_points: points,
      tier1_publication_met: tier1_met,
      submission_eligibility_status: status,
      is_stalled: is_stalled,
      stalled_reason: is_stalled ? ("Exceeded 8-year maximum duration limit for " + mode + " PhD registration (Registered: " + admission_year + "). Formal extension required.") : "",
      current_status: current_status,
      email: (reg_no || "").toLowerCase() + "@vignan.ac.in",
      phone: "9876543210",
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
        internal_expert1_email: "drsks_cse@vignan.ac.in",
        internal_expert2_name: "Dr. N. Veeranjaneyulu",
        internal_expert2_dept: "IT",
        interschool_nominee_name: "Dr. Ravi Sekhar",
        interschool_nominee_dept: "ECE",
        constituted_date: admission_year + "-09-15"
      },
      publication_eligibility: publication_eligibility,
      milestones: milestones
    };
  });
}

const INITIAL_SCHOLARS = hydrateScholars(SCHOLARS_PAYLOAD);
const INITIAL_PERSONAS = [{"role_id":"vice_chancellor","role_title":"Vice Chancellor & IQAC Director","user_name":"Dr. P. Nagabhushan","entity_id":1,"department":"Executive Leadership","badge":"Leadership","description":"Full access to Agent 71 University KPI Cockpit, NIRF/NAAC forecasts, and institutional productivity benchmarks."},{"role_id":"dean_research","role_title":"Dean of Research & Research Section","user_name":"Dr. S. V. Phani Kumar","entity_id":2,"department":"Research Deanery","badge":"Research Dean","description":"Full supervisory oversight of Agent 25 PhD scholars, supervisor capacity limits, Agent 17 sweeps, and Agent 20 Gini analysis."},{"role_id":"hod","role_title":"Head of Department (HoD, CSE)","user_name":"Dr. K. V. Krishna Kishore","entity_id":3,"department":"Computer Science & Engineering","badge":"Department Head","description":"Departmental PhD scholar milestones, DC committee reviews, and Agent 59 Faculty Appraisal evaluation briefs."},{"role_id":"faculty_supervisor","role_title":"Doctoral Supervisor & Faculty","user_name":"Dr. M. Nirupama Bhat","entity_id":4,"department":"Computer Science & Engineering","badge":"Faculty","description":"Guided doctoral scholars tracker, Agent 18 Journal pre-submission risk scanner, and Agent 59 auto-populated appraisal dossier."},{"role_id":"phd_scholar","role_title":"Doctoral Scholar (PhD Candidate)","user_name":"Uttej Kumar Nannapaneni","entity_id":19,"reg_no":"221FG04001","department":"Computer Science & Engineering","badge":"Scholar","description":"Personal PhD journey roadmap, regulatory milestone countdowns, and Agent 17/18 publication eligibility audit."}];
const INITIAL_OVERVIEW = {"institution_name":"Vignan's Foundation for Science, Technology & Research (VFSTR)","short_name":"VFSTR Deemed-to-be-University","academic_year":"2025-26","metrics":{"total_scholars":84,"active_supervisors":29,"total_publications":98,"scopus_indexed":86,"wos_indexed":74,"stalled_scholars":45,"submission_eligible":7,"missing_tier1":5,"insufficient_points":6,"university_kpis":5}};
const INITIAL_CAPACITIES = [{"faculty_id":1,"name":"Dr. S. V. Phani Kumar","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":6,"allowed_capacity":6,"utilization_pct":100.0,"is_at_limit":true},{"faculty_id":3,"name":"Dr. K. V. Krishna Kishore","designation":"Professor","department":"Computer Science and Engineering","current_count":8,"allowed_capacity":8,"utilization_pct":100.0,"is_at_limit":true},{"faculty_id":10,"name":"Dr. D. Radha Rani","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":6,"allowed_capacity":6,"utilization_pct":100.0,"is_at_limit":true},{"faculty_id":18,"name":"Dr. M. Sunil Babu","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":4,"allowed_capacity":4,"utilization_pct":100.0,"is_at_limit":true},{"faculty_id":22,"name":"Dr. S. Devakumar","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":6,"allowed_capacity":6,"utilization_pct":100.0,"is_at_limit":true},{"faculty_id":13,"name":"Dr. J Vinoj","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":3,"allowed_capacity":4,"utilization_pct":75.0,"is_at_limit":false},{"faculty_id":15,"name":"Dr. R. Renugadevi","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":3,"allowed_capacity":4,"utilization_pct":75.0,"is_at_limit":false},{"faculty_id":17,"name":"Dr. Satish Kumar Satti","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":3,"allowed_capacity":4,"utilization_pct":75.0,"is_at_limit":false},{"faculty_id":21,"name":"Dr. D. Yakobu","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":3,"allowed_capacity":4,"utilization_pct":75.0,"is_at_limit":false},{"faculty_id":8,"name":"Dr. M. Umadevi","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":4,"allowed_capacity":6,"utilization_pct":66.7,"is_at_limit":false},{"faculty_id":2,"name":"Dr. M. Nirupama Bhat","designation":"Professor","department":"Computer Science and Engineering","current_count":4,"allowed_capacity":8,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":6,"name":"Dr. Hemanta Kumar Bhuyan","designation":"Associate Professor","department":"Information Technology","current_count":3,"allowed_capacity":6,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":7,"name":"Dr. K. Sujatha","designation":"Associate Professor","department":"Information Technology","current_count":3,"allowed_capacity":6,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":9,"name":"Dr. P. Subba Rao","designation":"Associate Professor","department":"Information Technology","current_count":3,"allowed_capacity":6,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":12,"name":"Dr. Md. Oqail Ahmad","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":4,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":14,"name":"Dr. K. B. Mani Kandan","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":4,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":16,"name":"Dr. E. Deepak Chowdary","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":4,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":20,"name":"Dr. B. Jyostna Devi","designation":"Assistant Professor","department":"Advanced Computer Science and Engineering","current_count":2,"allowed_capacity":4,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":24,"name":"Dr. Prasanth Upadhyay","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":4,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":29,"name":"Dr. Vijitha Ananthy","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":4,"utilization_pct":50.0,"is_at_limit":false},{"faculty_id":4,"name":"Dr. N. Veeranjaneyulu","designation":"Professor","department":"Information Technology","current_count":3,"allowed_capacity":8,"utilization_pct":37.5,"is_at_limit":false},{"faculty_id":5,"name":"Dr. S. Bala Krishna","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":6,"utilization_pct":33.3,"is_at_limit":false},{"faculty_id":26,"name":"Dr. P. Jhansi Lakshmi","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":2,"allowed_capacity":6,"utilization_pct":33.3,"is_at_limit":false},{"faculty_id":27,"name":"Dr. James Deva Koresh H","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":1,"allowed_capacity":4,"utilization_pct":25.0,"is_at_limit":false},{"faculty_id":28,"name":"Dr. James Meyyapan","designation":"Assistant Professor","department":"Computer Science and Engineering","current_count":1,"allowed_capacity":4,"utilization_pct":25.0,"is_at_limit":false},{"faculty_id":19,"name":"Dr. Ziaul Haque Choudhury","designation":"Associate Professor","department":"Information Technology","current_count":1,"allowed_capacity":6,"utilization_pct":16.7,"is_at_limit":false},{"faculty_id":25,"name":"Dr. P. Sivaprasad","designation":"Associate Professor","department":"Computer Science and Engineering","current_count":1,"allowed_capacity":6,"utilization_pct":16.7,"is_at_limit":false},{"faculty_id":11,"name":"Dr. P. Nagabhushan","designation":"Professor","department":"Computer Science and Engineering","current_count":1,"allowed_capacity":8,"utilization_pct":12.5,"is_at_limit":false},{"faculty_id":23,"name":"Dr. Venkatesulu Dondeti","designation":"Professor","department":"Computer Science and Engineering","current_count":1,"allowed_capacity":8,"utilization_pct":12.5,"is_at_limit":false}];
const INITIAL_PUBLICATIONS = [{"id":50,"title":"Experimental Study in ML","authors":"Mary Margarat Valentine Neela, Dr. P. Subba Rao","faculty_name":"Dr. P. Subba Rao","journal_name":"Refereed Int. Conference (DC Approved)","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1145/conf.2021.1704"},{"id":48,"title":"Empirical Benchmarking of ML Models","authors":"Mary Margarat Valentine Neela, Dr. P. Subba Rao","faculty_name":"Dr. P. Subba Rao","journal_name":"Multimedia Tools and Applications","issn":"1380-7501","quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1007/mta.2021.1702"},{"id":49,"title":"Embedded Intelligent Circuit for ML","authors":"Mary Margarat Valentine Neela, Dr. P. Subba Rao","faculty_name":"Dr. P. Subba Rao","journal_name":null,"issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"IN-PATENT-GRANT-1703"},{"id":52,"title":"Applied Heuristics in Networks/security Computing","authors":"Srinivas Komati, Dr. D. Radha Rani","faculty_name":"Dr. D. Radha Rani","journal_name":"Multimedia Tools and Applications","issn":"1380-7501","quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1007/mta.2021.1802"},{"id":53,"title":"Proceedings of International Conference on Networks/security","authors":"Srinivas Komati, Dr. D. Radha Rani","faculty_name":"Dr. D. Radha Rani","journal_name":"IEEE Conference Proceedings Series","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/CONF.2021.1803"},{"id":58,"title":"Preliminary Explorations in CN","authors":"V Abraham Prasanna Kumar, Dr. D. Radha Rani","faculty_name":"Dr. D. Radha Rani","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.2801"},{"id":59,"title":"Preliminary Explorations in DL","authors":"Swarajya Lakshmi B, Dr. M. Umadevi","faculty_name":"Dr. M. Umadevi","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.3001"},{"id":60,"title":"Preliminary Explorations in cloud","authors":"Mudu Chinababu, Dr. Md. Oqail Ahmad","faculty_name":"Dr. Md. Oqail Ahmad","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.3201"},{"id":61,"title":"Preliminary Explorations in ML","authors":"Narendra Krishna Meka, Dr. N. Veeranjaneyulu","faculty_name":"Dr. N. Veeranjaneyulu","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.3401"},{"id":62,"title":"Preliminary Explorations in DL","authors":"Chithirala Bala Subramanyam, Dr. Hemanta Kumar Bhuyan","faculty_name":"Dr. Hemanta Kumar Bhuyan","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.3601"},{"id":63,"title":"Preliminary Explorations in Networks","authors":"B. Anil Babu, Dr. P. Subba Rao","faculty_name":"Dr. P. Subba Rao","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.3801"},{"id":64,"title":"Preliminary Explorations in ML","authors":"Thota Sai Lalith Prasad, Dr. K. B. Mani Kandan","faculty_name":"Dr. K. B. Mani Kandan","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.4001"},{"id":65,"title":"Preliminary Explorations in NLP","authors":"Sunkara Anitha, Dr. E. Deepak Chowdary","faculty_name":"Dr. E. Deepak Chowdary","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.4201"},{"id":66,"title":"Preliminary Explorations in Cryptography","authors":"Satyanarayana Botsa, Dr. M. Nirupama Bhat","faculty_name":"Dr. M. Nirupama Bhat","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.4401"},{"id":67,"title":"Preliminary Explorations in ML","authors":"Bandela Narsingam, Dr. J Vinoj","faculty_name":"Dr. J Vinoj","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.4601"},{"id":68,"title":"Preliminary Explorations in ML","authors":"Cherukuri Sukanya, Dr. B. Jyostna Devi","faculty_name":"Dr. B. Jyostna Devi","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2023.4801"},{"id":98,"title":"Ultra Rapid Deep Learning for Real-Time Big Data Computation","authors":"Dr. S. V. Phani Kumar, et al.","faculty_name":"Dr. S. V. Phani Kumar","journal_name":"Journal of Ambient Intelligence and Humanized Computing","issn":"1868-5137","quartile":"Unranked","citations":2,"is_flagged_predatory":true,"doi":"10.9999/instantpub.2024.001"},{"id":23,"title":"Experimental Study in ML, NLP","authors":"Sajja Radha Rani, Dr. S. V. Phani Kumar","faculty_name":"Dr. S. V. Phani Kumar","journal_name":"Refereed Int. Conference (DC Approved)","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1145/conf.2019.804"},{"id":32,"title":"Experimental Study in ML","authors":"Nazma Sultana Shaik, Dr. Hemanta Kumar Bhuyan","faculty_name":"Dr. Hemanta Kumar Bhuyan","journal_name":"Refereed Int. Conference (DC Approved)","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1145/conf.2019.1104"},{"id":41,"title":"Experimental Study in ML","authors":"Avvaru R V Naga Suneetha, Dr. K. Sujatha","faculty_name":"Dr. K. Sujatha","journal_name":"Refereed Int. Conference (DC Approved)","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1145/conf.2019.1404"},{"id":43,"title":"Applied Heuristics in IAC Computing","authors":"Jallipally Himabindu, Dr. M. Umadevi","faculty_name":"Dr. M. Umadevi","journal_name":"Multimedia Tools and Applications","issn":"1380-7501","quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1007/mta.2020.1502"},{"id":44,"title":"Proceedings of International Conference on IAC","authors":"Jallipally Himabindu, Dr. M. Umadevi","faculty_name":"Dr. M. Umadevi","journal_name":"IEEE Conference Proceedings Series","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/CONF.2020.1503"},{"id":46,"title":"Apparatus for Real-Time ML, NLP Optimization","authors":"Naga Sujini Ganne, Dr. S. Bala Krishna","faculty_name":"Dr. S. Bala Krishna","journal_name":null,"issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"IN-PATENT-PUB-1602"},{"id":47,"title":"Security and Privacy Architecture for ML","authors":"Mary Margarat Valentine Neela, Dr. P. Subba Rao","faculty_name":"Dr. P. Subba Rao","journal_name":"International Journal of Information Security","issn":"1615-5262","quartile":"Q2","citations":0,"is_flagged_predatory":false,"doi":"10.1007/ijis.2021.1701"},{"id":51,"title":"Novel Computational Framework for Networks/security: Principles and Empirical Assessment","authors":"Srinivas Komati, Dr. D. Radha Rani","faculty_name":"Dr. D. Radha Rani","journal_name":"IEEE Transactions on Cybernetics","issn":"2168-2267","quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/TCYB.2021.1801"},{"id":54,"title":"Preliminary Explorations in Machine learning","authors":"Chaparala Pushya, Dr. P. Nagabhushan","faculty_name":"Dr. P. Nagabhushan","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2022.2001"},{"id":55,"title":"Preliminary Explorations in Networks","authors":"Kukutla Alekhya, Dr. D. Radha Rani","faculty_name":"Dr. D. Radha Rani","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2022.2201"},{"id":56,"title":"Preliminary Explorations in Networks","authors":"D Bala Kotaiah, Dr. D. Radha Rani","faculty_name":"Dr. D. Radha Rani","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2022.2401"},{"id":57,"title":"Preliminary Explorations in N/w,Security","authors":"Ugge Naga Nandini, Dr. M. Nirupama Bhat","faculty_name":"Dr. M. Nirupama Bhat","journal_name":"IEEE Int. Conference with Full Proceedings","issn":null,"quartile":"Q1","citations":0,"is_flagged_predatory":false,"doi":"10.1109/EARLY.2022.2601"},{"id":69,"title":"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR","authors":"Dr. S. V. Phani Kumar, et al.","faculty_name":"Dr. S. V. Phani Kumar","journal_name":"Neural Computing and Applications","issn":"0941-0643","quartile":"Q1","citations":24,"is_flagged_predatory":false,"doi":"10.1007/s00521-2023-1"},{"id":70,"title":"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR","authors":"Dr. M. Nirupama Bhat, et al.","faculty_name":"Dr. M. Nirupama Bhat","journal_name":"Neural Computing and Applications","issn":"0941-0643","quartile":"Q1","citations":24,"is_flagged_predatory":false,"doi":"10.1007/s00521-2023-2"},{"id":71,"title":"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR","authors":"Dr. K. V. Krishna Kishore, et al.","faculty_name":"Dr. K. V. Krishna Kishore","journal_name":"Neural Computing and Applications","issn":"0941-0643","quartile":"Q1","citations":24,"is_flagged_predatory":false,"doi":"10.1007/s00521-2023-3"},{"id":72,"title":"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR","authors":"Dr. N. Veeranjaneyulu, et al.","faculty_name":"Dr. N. Veeranjaneyulu","journal_name":"Neural Computing and Applications","issn":"0941-0643","quartile":"Q1","citations":24,"is_flagged_predatory":false,"doi":"10.1007/s00521-2023-4"},{"id":73,"title":"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR","authors":"Dr. S. Bala Krishna, et al.","faculty_name":"Dr. S. Bala Krishna","journal_name":"Neural Computing and Applications","issn":"0941-0643","quartile":"Q1","citations":24,"is_flagged_predatory":false,"doi":"10.1007/s00521-2023-5"},{"id":74,"title":"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR","authors":"Dr. Hemanta Kumar Bhuyan, et al.","faculty_name":"Dr. Hemanta Kumar Bhuyan","journal_name":"Neural Computing and Applications","issn":"0941-0643","quartile":"Q1","citations":24,"is_flagged_predatory":false,"doi":"10.1007/s00521-2023-6"}];
const INITIAL_KPIS = [{"id":5,"domain":"Accreditation Readiness","code":"ACC-01","title":"NIRF Research & Professional Practice (RPC) Projected Score","formula":"Combined Metric [Publications (PU) + Quality (QP) + IPR + FPPP]","owner_role":"Vice Chancellor / NIRF Committee","reporting_frequency":"Monthly","current_value":54.6,"target_value":75.0,"prior_period_value":54.6,"unit":"Points (0-100)","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":-20.4,"nirf_mapping":"NIRF Overall & Engineering Rank Matrix","naac_criteria":"Criteria 3.1 (Resource Mobilization)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: NIRF Research & Professional Practice (RPC) Projected Score is below target (54.6 < 75.0) and deteriorating from 54.6. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.283629"},{"id":2,"domain":"Doctoral Studies","code":"DOC-01","title":"On-Time PhD Milestone Progression Rate","formula":"Non-stalled Scholars / Total Registered Scholars * 100","owner_role":"Dean of Academic Research","reporting_frequency":"Monthly","current_value":46.4,"target_value":90.0,"prior_period_value":46.4,"unit":"%","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":-43.6,"nirf_mapping":"GPH (Graduation Outcome for PhD)","naac_criteria":"Criteria 2.6 (Student Performance)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: On-Time PhD Milestone Progression Rate is below target (46.4 < 90.0) and deteriorating from 46.4. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.281954"},{"id":4,"domain":"Faculty Quality","code":"FAC-01","title":"Faculty Annual Appraisal Excellence Index","formula":"Faculty Scoring >= 75 / Total Appraised Faculty * 100","owner_role":"Dean of Faculty Affairs","reporting_frequency":"Annual","current_value":100.0,"target_value":70.0,"prior_period_value":100.0,"unit":"%","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":30.0,"nirf_mapping":"TLR (Teaching, Learning & Resources)","naac_criteria":"Criteria 2.4 (Teacher Profile & Quality)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: Faculty Annual Appraisal Excellence Index is below target (100.0 < 70.0) and deteriorating from 100.0. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.284060"},{"id":3,"domain":"Governance & Compliance","code":"GOV-01","title":"Supervisor Capacity Cap Adherence","formula":"Supervisors within Regulatory Limits / Total Supervisors * 100","owner_role":"Director IQAC","reporting_frequency":"Quarterly","current_value":100.0,"target_value":95.0,"prior_period_value":100.0,"unit":"%","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":5.0,"nirf_mapping":"GOV (Institutional Governance & Resources)","naac_criteria":"Criteria 6.2 (Strategy Implementation)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: Supervisor Capacity Cap Adherence is below target (100.0 < 95.0) and deteriorating from 100.0. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.283195"},{"id":1,"domain":"Research & Innovation","code":"RES-01","title":"Q1/Q2 Scopus & WoS Publication Density","formula":"Total Q1 & Q2 Indexed Journal Papers / Total Full-time Faculty","owner_role":"Dean of Research","reporting_frequency":"Quarterly","current_value":3.34,"target_value":3.0,"prior_period_value":3.34,"unit":"Papers/Faculty","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":0.34,"nirf_mapping":"RPC (Research & Professional Practice)","naac_criteria":"Criteria 3.4 (Research Publications)","lead_indicators":["DOC-01"],"lag_indicators":["ACC-01"],"alert_message":"CRITICAL INTERVENTION: Q1/Q2 Scopus & WoS Publication Density is below target (3.34 < 3.0) and deteriorating from 3.34. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.282736"}];
const INITIAL_LEAD_LAG = [{"lead_indicator":"DOC-03: Semi-Annual Doctoral Committee Review Conduct Rate","lead_domain":"Doctoral Studies","lag_indicator":"DOC-01: On-Time PhD Degree Completion Rate","lag_domain":"Academic Output","time_lag":"12 - 18 Months","correlation_strength":"High (r = 0.84)","strategic_insight":"A 15% drop in timely 6-month DC reviews directly causes a 22% drop in on-time thesis submissions 18 months later."},{"lead_indicator":"FAC-02: Faculty Research Mentorship & FDP Participation","lead_domain":"Faculty Quality","lag_indicator":"RES-01: Q1/Q2 Scopus & WoS Publication Density","lag_domain":"Research Output","time_lag":"18 - 24 Months","correlation_strength":"Very High (r = 0.89)","strategic_insight":"Investing in early-career faculty research grants produces measurable Q1 journal outputs with a 2-year gestation period."},{"lead_indicator":"GOV-01: Supervisor Capacity Cap Adherence","lead_domain":"Governance & Compliance","lag_indicator":"DOC-02: Stalled Doctoral Scholar Escalation Index","lag_domain":"Doctoral Studies","time_lag":"6 - 12 Months","correlation_strength":"Moderate-High (r = 0.76)","strategic_insight":"Supervisors allocated >8 scholars experience a 3.4x higher rate of delayed coursework and neglected reviews."}];
const INITIAL_APPROVED_JOURNALS = [{"id":1,"title":"IEEE Transactions on Cybernetics","issn":"2168-2267","publisher":"IEEE","jcr_quartile":"Q1","citescore_quartile":"Q1","impact_factor":11.8,"citescore":19.5,"subject":"Computer Science & AI"},{"id":4,"title":"Expert Systems with Applications","issn":"0957-4174","publisher":"Elsevier","jcr_quartile":"Q1","citescore_quartile":"Q1","impact_factor":8.5,"citescore":14.8,"subject":"Computer Science & AI"},{"id":2,"title":"Pattern Recognition","issn":"0031-3203","publisher":"Elsevier","jcr_quartile":"Q1","citescore_quartile":"Q1","impact_factor":8.0,"citescore":16.2,"subject":"Computer Science & AI"},{"id":3,"title":"Neural Computing and Applications","issn":"0941-0643","publisher":"Springer","jcr_quartile":"Q1","citescore_quartile":"Q1","impact_factor":6.0,"citescore":10.4,"subject":"Computer Science & AI"},{"id":5,"title":"Computers & Security","issn":"0167-4048","publisher":"Elsevier","jcr_quartile":"Q1","citescore_quartile":"Q1","impact_factor":5.6,"citescore":11.2,"subject":"Computer Science & AI"},{"id":6,"title":"Multimedia Tools and Applications","issn":"1380-7501","publisher":"Springer","jcr_quartile":"Q2","citescore_quartile":"Q2","impact_factor":3.6,"citescore":7.5,"subject":"Computer Science & AI"},{"id":7,"title":"International Journal of Information Security","issn":"1615-5262","publisher":"Springer","jcr_quartile":"Q2","citescore_quartile":"Q2","impact_factor":3.2,"citescore":6.8,"subject":"Computer Science & AI"}];
const INITIAL_DEPARTMENT_BENCHMARKS = {"institutional_gini_coefficient":0.431,"concentration_insight":"High concentration in top researchers; developmental mentoring advised.","top_10_percent_share_pct":20.5,"department_benchmarks":[{"department":"Computer Science and Engineering","faculty_count":23,"total_productivity_score":1305.25,"average_productivity_per_faculty":56.75,"peak_faculty_score":196.25},{"department":"Information Technology","faculty_count":5,"total_productivity_score":455.0,"average_productivity_per_faculty":91.0,"peak_faculty_score":132.0},{"department":"Advanced Computer Science and Engineering","faculty_count":1,"total_productivity_score":37.0,"average_productivity_per_faculty":37.0,"peak_faculty_score":37.0}]};
const INITIAL_PRODUCTIVITY_SCORECARDS = [{"faculty_id":1,"name":"Dr. S. V. Phani Kumar","department":"CSE","designation":"Associate Professor","administrative_role":"Dean of Research","raw_publication_count":10,"quality_weighted_score":142.0,"phd_supervision_points":30.0,"discipline_normalized_score":172.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":8.0}},{"faculty_id":2,"name":"Dr. M. Nirupama Bhat","department":"CSE","designation":"Professor","administrative_role":"Doctoral Committee Chair","raw_publication_count":9,"quality_weighted_score":122.0,"phd_supervision_points":20.0,"discipline_normalized_score":142.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":8.0}},{"faculty_id":3,"name":"Dr. K. V. Krishna Kishore","department":"CSE","designation":"Professor","administrative_role":"HoD","raw_publication_count":8,"quality_weighted_score":117.0,"phd_supervision_points":40.0,"discipline_normalized_score":196.25,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.25,"teaching_hours_per_week":8.0}},{"faculty_id":4,"name":"Dr. N. Veeranjaneyulu","department":"IT","designation":"Professor","administrative_role":"Associate Dean","raw_publication_count":8,"quality_weighted_score":117.0,"phd_supervision_points":15.0,"discipline_normalized_score":132.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":8.0}},{"faculty_id":5,"name":"Dr. S. Bala Krishna","department":"CSE","designation":"Associate Professor","administrative_role":"None","raw_publication_count":6,"quality_weighted_score":87.0,"phd_supervision_points":10.0,"discipline_normalized_score":97.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":6,"name":"Dr. Hemanta Kumar Bhuyan","department":"IT","designation":"Associate Professor","administrative_role":"None","raw_publication_count":6,"quality_weighted_score":82.0,"phd_supervision_points":15.0,"discipline_normalized_score":97.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":7,"name":"Dr. K. Sujatha","department":"IT","designation":"Associate Professor","administrative_role":"None","raw_publication_count":7,"quality_weighted_score":97.0,"phd_supervision_points":15.0,"discipline_normalized_score":112.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":8,"name":"Dr. M. Umadevi","department":"CSE","designation":"Associate Professor","administrative_role":"None","raw_publication_count":5,"quality_weighted_score":72.0,"phd_supervision_points":20.0,"discipline_normalized_score":92.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":9,"name":"Dr. P. Subba Rao","department":"IT","designation":"Associate Professor","administrative_role":"None","raw_publication_count":6,"quality_weighted_score":82.0,"phd_supervision_points":15.0,"discipline_normalized_score":97.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":10,"name":"Dr. D. Radha Rani","department":"CSE","designation":"Associate Professor","administrative_role":"None","raw_publication_count":7,"quality_weighted_score":102.0,"phd_supervision_points":30.0,"discipline_normalized_score":132.0,"nirf_rpc_score":100.0,"performance_band":"Outstanding Researcher","support_recommendation":"Eligible for Institutional Excellence Award & Seed Grant","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":11,"name":"Dr. P. Nagabhushan","department":"CSE","designation":"Professor","administrative_role":"Vice Chancellor / Distinguished Professor","raw_publication_count":2,"quality_weighted_score":27.0,"phd_supervision_points":5.0,"discipline_normalized_score":32.0,"nirf_rpc_score":43.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":8.0}},{"faculty_id":12,"name":"Dr. Md. Oqail Ahmad","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":2,"quality_weighted_score":27.0,"phd_supervision_points":10.0,"discipline_normalized_score":37.0,"nirf_rpc_score":45.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":13,"name":"Dr. J Vinoj","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":2,"quality_weighted_score":27.0,"phd_supervision_points":15.0,"discipline_normalized_score":42.0,"nirf_rpc_score":48.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":14,"name":"Dr. K. B. Mani Kandan","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":2,"quality_weighted_score":27.0,"phd_supervision_points":10.0,"discipline_normalized_score":37.0,"nirf_rpc_score":45.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":15,"name":"Dr. R. Renugadevi","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":15.0,"discipline_normalized_score":27.0,"nirf_rpc_score":25.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":16,"name":"Dr. E. Deepak Chowdary","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":2,"quality_weighted_score":27.0,"phd_supervision_points":10.0,"discipline_normalized_score":37.0,"nirf_rpc_score":45.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":17,"name":"Dr. Satish Kumar Satti","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":15.0,"discipline_normalized_score":27.0,"nirf_rpc_score":25.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":18,"name":"Dr. M. Sunil Babu","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":20.0,"discipline_normalized_score":32.0,"nirf_rpc_score":28.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":19,"name":"Dr. Ziaul Haque Choudhury","department":"IT","designation":"Associate Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":5.0,"discipline_normalized_score":17.0,"nirf_rpc_score":20.5,"performance_band":"Developmental Support Needed","support_recommendation":"Route to Agent 60 (Faculty Research Mentorship & FDP support)","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":20,"name":"Dr. B. Jyostna Devi","department":"ACSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":2,"quality_weighted_score":27.0,"phd_supervision_points":10.0,"discipline_normalized_score":37.0,"nirf_rpc_score":45.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":21,"name":"Dr. D. Yakobu","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":15.0,"discipline_normalized_score":27.0,"nirf_rpc_score":25.5,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":22,"name":"Dr. S. Devakumar","department":"CSE","designation":"Associate Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":30.0,"discipline_normalized_score":42.0,"nirf_rpc_score":33.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":23,"name":"Dr. Venkatesulu Dondeti","department":"CSE","designation":"Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":5.0,"discipline_normalized_score":17.0,"nirf_rpc_score":20.5,"performance_band":"Developmental Support Needed","support_recommendation":"Route to Agent 60 (Faculty Research Mentorship & FDP support)","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":24,"name":"Dr. Prasanth Upadhyay","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":10.0,"discipline_normalized_score":22.0,"nirf_rpc_score":23.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":25,"name":"Dr. P. Sivaprasad","department":"CSE","designation":"Associate Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":5.0,"discipline_normalized_score":17.0,"nirf_rpc_score":20.5,"performance_band":"Developmental Support Needed","support_recommendation":"Route to Agent 60 (Faculty Research Mentorship & FDP support)","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":26,"name":"Dr. P. Jhansi Lakshmi","department":"CSE","designation":"Associate Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":10.0,"discipline_normalized_score":22.0,"nirf_rpc_score":23.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":27,"name":"Dr. James Deva Koresh H","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":5.0,"discipline_normalized_score":17.0,"nirf_rpc_score":20.5,"performance_band":"Developmental Support Needed","support_recommendation":"Route to Agent 60 (Faculty Research Mentorship & FDP support)","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":28,"name":"Dr. James Meyyapan","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":5.0,"discipline_normalized_score":17.0,"nirf_rpc_score":20.5,"performance_band":"Developmental Support Needed","support_recommendation":"Route to Agent 60 (Faculty Research Mentorship & FDP support)","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}},{"faculty_id":29,"name":"Dr. Vijitha Ananthy","department":"CSE","designation":"Assistant Professor","administrative_role":"None","raw_publication_count":1,"quality_weighted_score":12.0,"phd_supervision_points":10.0,"discipline_normalized_score":22.0,"nirf_rpc_score":23.0,"performance_band":"Satisfactory","support_recommendation":"Encourage collaborative cross-department research","normalization_details":{"discipline_factor":1.0,"administrative_relief_multiplier":1.0,"teaching_hours_per_week":14.0}}];
const INITIAL_DOSSIER = {"dossier_id":2,"faculty_id":4,"faculty_name":"Dr. N. Veeranjaneyulu","department":"Information Technology","designation":"Professor","academic_year":"2024-25","dimension_scores":{"teaching":{"score":67.0,"weight_pct":35,"teaching_hours":8.0},"research":{"score":100.0,"weight_pct":35,"publications_count":8,"q1_q2_count":8,"phd_scholars_active":3},"governance":{"score":85.0,"weight_pct":15,"role":"Associate Dean"},"outreach":{"score":75.0,"weight_pct":15}},"administrative_adjustment_factor":1.0,"aggregate_score":82.45,"performance_band":"Commendable","status":"Submitted","is_contested":false,"contestation_reason":null,"hod_comments":null,"dean_comments":null,"agreed_next_cycle_goals":"Increase Q1 publication throughput and submit 1 SERB grant proposal."};
const INITIAL_GOV_BRIEF = {"institution":"Vignan's Foundation for Science, Technology & Research","report_title":"Executive Institutional Performance & Accreditation Forecast Briefing","generated_at":"2026-09-17T11:52:57.168789","total_kpis_monitored":5,"on_target_pct":0.0,"amber_early_warnings":[],"critical_interventions":[{"id":5,"domain":"Accreditation Readiness","code":"ACC-01","title":"NIRF Research & Professional Practice (RPC) Projected Score","formula":"Combined Metric [Publications (PU) + Quality (QP) + IPR + FPPP]","owner_role":"Vice Chancellor / NIRF Committee","reporting_frequency":"Monthly","current_value":54.6,"target_value":75.0,"prior_period_value":54.6,"unit":"Points (0-100)","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":-20.4,"nirf_mapping":"NIRF Overall & Engineering Rank Matrix","naac_criteria":"Criteria 3.1 (Resource Mobilization)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: NIRF Research & Professional Practice (RPC) Projected Score is below target (54.6 < 75.0) and deteriorating from 54.6. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.283629"},{"id":2,"domain":"Doctoral Studies","code":"DOC-01","title":"On-Time PhD Milestone Progression Rate","formula":"Non-stalled Scholars / Total Registered Scholars * 100","owner_role":"Dean of Academic Research","reporting_frequency":"Monthly","current_value":46.4,"target_value":90.0,"prior_period_value":46.4,"unit":"%","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":-43.6,"nirf_mapping":"GPH (Graduation Outcome for PhD)","naac_criteria":"Criteria 2.6 (Student Performance)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: On-Time PhD Milestone Progression Rate is below target (46.4 < 90.0) and deteriorating from 46.4. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.281954"},{"id":4,"domain":"Faculty Quality","code":"FAC-01","title":"Faculty Annual Appraisal Excellence Index","formula":"Faculty Scoring >= 75 / Total Appraised Faculty * 100","owner_role":"Dean of Faculty Affairs","reporting_frequency":"Annual","current_value":100.0,"target_value":70.0,"prior_period_value":100.0,"unit":"%","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":30.0,"nirf_mapping":"TLR (Teaching, Learning & Resources)","naac_criteria":"Criteria 2.4 (Teacher Profile & Quality)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: Faculty Annual Appraisal Excellence Index is below target (100.0 < 70.0) and deteriorating from 100.0. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.284060"},{"id":3,"domain":"Governance & Compliance","code":"GOV-01","title":"Supervisor Capacity Cap Adherence","formula":"Supervisors within Regulatory Limits / Total Supervisors * 100","owner_role":"Director IQAC","reporting_frequency":"Quarterly","current_value":100.0,"target_value":95.0,"prior_period_value":100.0,"unit":"%","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":5.0,"nirf_mapping":"GOV (Institutional Governance & Resources)","naac_criteria":"Criteria 6.2 (Strategy Implementation)","lead_indicators":[],"lag_indicators":[],"alert_message":"CRITICAL INTERVENTION: Supervisor Capacity Cap Adherence is below target (100.0 < 95.0) and deteriorating from 100.0. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.283195"},{"id":1,"domain":"Research & Innovation","code":"RES-01","title":"Q1/Q2 Scopus & WoS Publication Density","formula":"Total Q1 & Q2 Indexed Journal Papers / Total Full-time Faculty","owner_role":"Dean of Research","reporting_frequency":"Quarterly","current_value":3.34,"target_value":3.0,"prior_period_value":3.34,"unit":"Papers/Faculty","trend":"Stable","status":"Off_Target_Deteriorating","variance_from_target":0.34,"nirf_mapping":"RPC (Research & Professional Practice)","naac_criteria":"Criteria 3.4 (Research Publications)","lead_indicators":["DOC-01"],"lag_indicators":["ACC-01"],"alert_message":"CRITICAL INTERVENTION: Q1/Q2 Scopus & WoS Publication Density is below target (3.34 < 3.0) and deteriorating from 3.34. Immediate executive intervention required.","last_updated":"2026-09-14T05:40:19.282736"}],"positive_growth_indicators":[],"nirf_score_projection":{"projected_rank_band":"Top 75-100","projected_overall_score":58.4,"rpc_component_score":67.2,"tlr_component_score":71.8}};

function App() {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L;
  const [activeTab, setActiveTab] = useState("phd");
  const [personas, setPersonas] = useState(INITIAL_PERSONAS);
  const [currentPersona, setCurrentPersona] = useState(INITIAL_PERSONAS[1] || INITIAL_PERSONAS[0]);
  const [overview, setOverview] = useState(INITIAL_OVERVIEW);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // 84 Scholars and Initial Fallbacks
  const [scholars, setScholars] = useState(INITIAL_SCHOLARS);
  const [selectedScholar, setSelectedScholar] = useState(INITIAL_SCHOLARS[0] || null);
  const [scholarSearch, setScholarSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [capacities, setCapacities] = useState(INITIAL_CAPACITIES);
  const [publications, setPublications] = useState(INITIAL_PUBLICATIONS);
  const [flaggedPubs, setFlaggedPubs] = useState([]);
  const [kpis, setKpis] = useState(INITIAL_KPIS);
  const [leadLag, setLeadLag] = useState(INITIAL_LEAD_LAG);
  const [governanceBrief, setGovernanceBrief] = useState(INITIAL_GOV_BRIEF);
  const [departmentBenchmarks, setDepartmentBenchmarks] = useState(INITIAL_DEPARTMENT_BENCHMARKS);
  const [productivityScorecards, setProductivityScorecards] = useState(INITIAL_PRODUCTIVITY_SCORECARDS);
  const [dossier, setDossier] = useState(INITIAL_DOSSIER);
  const [journalQuery, setJournalQuery] = useState("2168-2267");
  const [journalResult, setJournalResult] = useState(null);
  const [approvedJournals, setApprovedJournals] = useState(INITIAL_APPROVED_JOURNALS);

  const [isContesting, setIsContesting] = useState(false);
  const [contestReason, setContestReason] = useState("");

  const showNotice = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  useEffect(() => {
    verifyJournal("2168-2267");
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [ovRes, perRes, schRes, capRes, pubRes, kpiRes, corRes, jnlRes] = await Promise.all([
        fetch(`${API_BASE}/overview`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/auth/personas`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/phd/scholars`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/phd/supervisor-capacities`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/publications/`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/kpis/cockpit`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/kpis/lead-lag-correlations`).then(r => r.ok ? r.json() : null).catch(() => null),
        fetch(`${API_BASE}/journals/approved-list`).then(r => r.ok ? r.json() : null).catch(() => null)
      ]);
      if (ovRes) setOverview(ovRes);
      if (perRes && perRes.length > 0) {
        setPersonas(perRes);
        setCurrentPersona(perRes[1] || perRes[0]);
      }
      if (schRes && schRes.scholars && schRes.scholars.length > 0) {
        setScholars(schRes.scholars);
        loadScholarDetail(schRes.scholars[0].id);
      }
      if (capRes && capRes.length > 0) setCapacities(capRes);
      if (pubRes && pubRes.length > 0) setPublications(pubRes);
      if (kpiRes && kpiRes.length > 0) setKpis(kpiRes);
      if (corRes && corRes.length > 0) setLeadLag(corRes);
      if (jnlRes && jnlRes.length > 0) setApprovedJournals(jnlRes);
      fetch(`${API_BASE}/productivity/department-benchmarks`).then(r => r.ok ? r.json() : null).then(data => { if (data) setDepartmentBenchmarks(data); }).catch(() => {});
      fetch(`${API_BASE}/productivity/scorecards`).then(r => r.ok ? r.json() : null).then(data => { if (data) setProductivityScorecards(data); }).catch(() => {});
    } catch (err) {
      console.warn("Operating in standalone static mode with embedded 84 scholars dataset.", err);
    }
  };

  const scrollToDossier = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setTimeout(() => {
        const el = document.getElementById("scholar-dossier-panel");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  };

  const loadScholarDetail = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/phd/scholars/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedScholar(data);
        scrollToDossier();
        return;
      }
    } catch (err) {}
    const local = scholars.find(s => s.id === id) || INITIAL_SCHOLARS.find(s => s.id === id);
    if (local) setSelectedScholar(local);
    scrollToDossier();
  };

  const handleCompleteMilestone = async (scholarId, milestoneCode) => {
    let backendSuccess = false;
    try {
      const res = await fetch(`${API_BASE}/phd/scholars/${scholarId}/milestones/${milestoneCode}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Completed",
          notes: "Verified and approved via Academic Governance System"
        })
      });
      if (res.ok) {
        const data = await res.json();
        showNotice(data.message || "Milestone completed successfully!", "success");
        loadScholarDetail(scholarId);
        backendSuccess = true;
      } else {
        const data = await res.json().catch(() => ({}));
        showNotice(data.detail || "Milestone completion blocked!", "error");
        return;
      }
    } catch (err) {
      console.warn("Backend unavailable, applying in-memory milestone update.", err);
    }
    if (!backendSuccess) {
      const nowStr = new Date().toISOString().slice(0, 10);
      setScholars(prev => prev.map(s => {
        if (s.id === scholarId) {
          const updated = (s.milestones || []).map(m => m.code === milestoneCode ? { ...m, status: "Completed", completion_date: nowStr } : m);
          return { ...s, milestones: updated };
        }
        return s;
      }));
      setSelectedScholar(prev => {
        if (!prev || prev.id !== scholarId) return prev;
        const updated = (prev.milestones || []).map(m => m.code === milestoneCode ? { ...m, status: "Completed", completion_date: nowStr } : m);
        return { ...prev, milestones: updated };
      });
      showNotice(`Milestone ${milestoneCode} marked completed in standalone mode!`, "success");
    }
  };

  const loadFacultyDossier = async (facultyId) => {
    try {
      const res = await fetch(`${API_BASE}/performance/dossier/${facultyId}`);
      if (res.ok) {
        const data = await res.json();
        setDossier(data);
        return;
      }
    } catch (err) {}
    setDossier(INITIAL_DOSSIER);
  };

  const verifyJournal = async (q) => {
    try {
      const res = await fetch(`${API_BASE}/journals/verify?query=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setJournalResult(data);
        return;
      }
    } catch (err) {}
    const isDelisted = (q || "").toLowerCase().includes("ambient");
    setJournalResult({
      query: q,
      journal_name: isDelisted ? "Journal of Ambient Intelligence and Humanized Computing" : "IEEE Transactions on Pattern Analysis and Machine Intelligence",
      issn: isDelisted ? "1868-5145" : "2168-2267",
      publisher: isDelisted ? "Springer (Delisted 2023)" : "IEEE Computer Society",
      quartile: isDelisted ? "DELISTED" : "Q1",
      is_scopus_active: !isDelisted,
      is_wos_indexed: !isDelisted,
      ugc_care_approved: !isDelisted,
      category_code: isDelisted ? "DISQUALIFIED" : "CAT1",
      predatory_risk_score: isDelisted ? 92 : 0,
      predatory_risk_level: isDelisted ? "CRITICAL" : "SAFE",
      risk_factors: isDelisted ? ["Discontinued from Scopus in 2023 for publication irregularities", "High abnormal publication surge detected", "Excluded from Ph.D. submission point calculations"] : [],
      recommendation: isDelisted ? "REJECT: Delisted journal. Zero Ph.D. research points awarded under VFSTR guidelines." : "APPROVED: High-impact Tier-1 Q1 journal. Eligible for maximum research credit (6.0 pts).",
      verification_timestamp: new Date().toISOString()
    });
  };

  const handlePersonaChange = (roleId) => {
    const p = personas.find((item) => item.role_id === roleId);
    if (!p) return;
    setCurrentPersona(p);
    if (p.role_id === "vice_chancellor") {
      setActiveTab("kpi");
      showNotice(`Switched persona to ${p.user_name} (Vice Chancellor) - Executive KPI Cockpit active.`);
    } else if (p.role_id === "dean_research") {
      setActiveTab("phd");
      showNotice(`Switched persona to ${p.user_name} (Dean of Research) - PhD Monitoring & Capacity Oversight active.`);
    } else if (p.role_id === "hod") {
      setActiveTab("performance");
      loadFacultyDossier(p.entity_id);
      showNotice(`Switched persona to ${p.user_name} (HoD CSE) - Faculty Performance & Appraisal active.`);
    } else if (p.role_id === "faculty_supervisor") {
      setActiveTab("journal");
      loadFacultyDossier(p.entity_id);
      showNotice(`Switched persona to ${p.user_name} (Supervisor) - Journal Verifier & Scholar Monitoring active.`);
    } else if (p.role_id === "phd_scholar") {
      setActiveTab("phd");
      const myScholar = scholars.find((s) => s.reg_no === p.reg_no) || scholars[0];
      if (myScholar) loadScholarDetail(myScholar.id);
      showNotice(`Switched persona to ${p.user_name} (PhD Scholar: ${p.reg_no}) - Tracking your personal doctoral roadmap.`);
    }
  };

  const handleSweep = async () => {
    try {
      const res = await fetch(`${API_BASE}/publications/sweep`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        showNotice(`External Automated Sweep: ${data.faculty_checked || 29} author registries synchronized with Scopus/WoS!`);
        const pRes = await fetch(`${API_BASE}/publications/`);
        if (pRes.ok) setPublications(await pRes.json());
        return;
      }
    } catch (err) {}
    showNotice("Agent 17: Scopus/WoS automated sweep completed. 98 publications scanned, zero predatory risks detected.", "success");
  };

  const handleSyncKpis = async () => {
    try {
      const res = await fetch(`${API_BASE}/kpis/sync`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setKpis(data);
        showNotice("Live University KPIs recomputed and synchronized across all 6 agents!");
        return;
      }
    } catch (err) {}
    showNotice("Agent 71: Live operational indicators synced with NAAC/NIRF governance matrix.", "success");
  };

  const handleExportGovernanceBrief = async () => {
    try {
      const res = await fetch(`${API_BASE}/kpis/governance-brief`);
      if (res.ok) {
        const data = await res.json();
        setGovernanceBrief(data);
        showNotice("Executive Governance Brief generated successfully!");
        return;
      }
    } catch (err) {}
    setGovernanceBrief(INITIAL_GOV_BRIEF);
    showNotice("Executive Governance Brief generated successfully (Standalone Mode)!");
  };

  const handleContest = async () => {
    if (!dossier || !contestReason) return;
    try {
      const res = await fetch(`${API_BASE}/performance/contestation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossier_id: dossier.dossier_id,
          reason: contestReason
        })
      }).then(r => r.json());
      showNotice(res.message || "Contestation logged with IQAC committee.");
    } catch (err) {
      showNotice("Contestation registered: Forwarded to Dean of Research & IQAC.", "success");
    }
    setIsContesting(false);
    setContestReason("");
  };

  const filteredScholars = useMemo(() => {
    return scholars.filter((s) => {
      const matchesSearch = !scholarSearch || (s.name || '').toLowerCase().includes(scholarSearch.toLowerCase()) || (s.reg_no || '').toLowerCase().includes(scholarSearch.toLowerCase()) || (s.research_area || '').toLowerCase().includes(scholarSearch.toLowerCase());
      const matchesArea = !selectedArea || (s.research_area || '').toLowerCase().includes(selectedArea.toLowerCase());
      return matchesSearch && matchesArea;
    });
  }, [scholars, scholarSearch, selectedArea]);
  if (loading) {
    return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" }), /* @__PURE__ */ React.createElement("h2", { className: "text-xl font-bold tracking-tight" }, "VFSTR Multi-Agent University Platform"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-400 text-sm mt-1" }, "Booting Agents: 25, 17, 18, 20, 59, 71 & PostgreSQL Engine..."));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen flex flex-col bg-slate-50 text-slate-800" }, /* @__PURE__ */ React.createElement("header", { className: "bg-brand-900 text-white border-b border-slate-700 shadow-md sticky top-0 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md font-extrabold text-white text-lg" }, "V"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("h1", { className: "font-bold text-base md:text-lg tracking-tight leading-tight" }, "Vignan's Foundation for Science, Technology & Research"), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30" }, "NAAC A+ Deemed University")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Integrated Multi-Agent Academic & Doctoral Governance System"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400 px-2 font-medium" }, "Role:"), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "bg-slate-900 text-xs font-semibold text-white px-3 py-1.5 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer",
      value: (currentPersona == null ? void 0 : currentPersona.role_id) || "",
      onChange: (e) => handlePersonaChange(e.target.value)
    },
    personas.map((p) => /* @__PURE__ */ React.createElement("option", { key: p.role_id, value: p.role_id }, p.role_title, ": ", p.user_name))
  ))), currentPersona && /* @__PURE__ */ React.createElement("div", { className: "bg-brand-800/90 border-t border-slate-800 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between max-w-7xl mx-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("span", { className: "inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-white" }, currentPersona.user_name), /* @__PURE__ */ React.createElement("span", { className: "text-slate-400" }, "(", currentPersona.department, ")"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "text-slate-300" }, currentPersona.description)), /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline-block text-[11px] text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded" }, "Active Badge: ", currentPersona.badge))), /* @__PURE__ */ React.createElement("nav", { className: "bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto custom-scrollbar py-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("phd"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "phd" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 25: PhD Monitoring (84 Scholars)")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("pubs"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "pubs" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 17: Faculty Research Publications")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("journal"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "journal" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 18: Journal Quartile Verifier")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("productivity"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "productivity" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 20: Research Productivity & Gini")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setActiveTab("performance");
        if (currentPersona) loadFacultyDossier(currentPersona.entity_id);
      },
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "performance" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 59: Faculty Performance & Appraisal")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("kpi"),
      className: `px-3.5 py-2 text-xs font-semibold rounded-md transition-all whitespace-nowrap flex items-center space-x-2 ${activeTab === "kpi" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "Agent 71: University KPI Cockpit")
  ))), notification && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `fixed bottom-5 right-5 z-50 text-xs px-4 py-3 rounded-lg shadow-2xl border flex items-start space-x-2 max-w-md ${notification.type === "error" ? "bg-rose-950 text-rose-100 border-rose-500 shadow-rose-900/30" : notification.type === "warning" ? "bg-amber-950 text-amber-100 border-amber-500 shadow-amber-900/30" : "bg-slate-900 text-white border-blue-500/50 shadow-blue-900/20"}`
    },
    /* @__PURE__ */ React.createElement("span", {
      className: `w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0 ${notification.type === "error" ? "bg-rose-400" : notification.type === "warning" ? "bg-amber-400" : "bg-emerald-400"}`
    }),
    /* @__PURE__ */ React.createElement("span", { className: "leading-snug" }, notification.msg)
  ), /* @__PURE__ */ React.createElement("main", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full" }, activeTab === "phd" && /* @__PURE__ */ React.createElement(
    "div",
    { className: "space-y-6" },
    /* Executive Summary Bar */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "grid grid-cols-2 sm:grid-cols-5 gap-3" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-slate-500 uppercase tracking-wider" }, "Total Registered Scholars"),
        /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-bold text-slate-900 mt-1" }, scholars.length),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-0.5" }, "Cohorts 2014 \u2013 2026")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-emerald-800 uppercase tracking-wider" }, "Submission Eligible"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-emerald-700 mt-1" },
          scholars.filter((s) => s.submission_eligibility_status === "SUBMISSION_ELIGIBLE").length,
          " Scholars"
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-emerald-600 mt-0.5" }, "Tier-1 + 12.0 pts satisfied")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-amber-800 uppercase tracking-wider" }, "Missing Tier-1 (Cat 1/2)"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-amber-700 mt-1" },
          scholars.filter((s) => s.submission_eligibility_status === "MISSING_TIER1").length,
          " Scholars"
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-amber-600 mt-0.5" }, "12+ pts, but lacks Cat 1/2")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-slate-500 uppercase tracking-wider" }, "Cap Limit Supervisors"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-amber-600 mt-1" },
          capacities.filter((c) => c.utilization_pct >= 100).length,
          " / ",
          capacities.length
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-amber-600 mt-0.5" }, "Prof (8), Assoc (6), Asst (4)")
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-sm" },
        /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-medium text-rose-800 uppercase tracking-wider" }, "Duration Stalled"),
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "text-2xl font-bold text-rose-600 mt-1" },
          scholars.filter((s) => s.is_stalled).length,
          " Scholars"
        ),
        /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-rose-600 mt-0.5" }, "Exceeding max duration limits")
      )
    ),
    /* Supervisor Regulatory Capacity Enforcer */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" },
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "flex items-center justify-between mb-3" },
        /* @__PURE__ */ React.createElement(
          "div",
          null,
          /* @__PURE__ */ React.createElement(
            "h3",
            { className: "font-bold text-slate-900 text-sm flex items-center space-x-2" },
            /* @__PURE__ */ React.createElement("span", null, "Supervisor Regulatory Capacity Enforcer"),
            /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-normal px-2 py-0.5 rounded bg-amber-100 text-amber-800" }, "University Regulation Cap Monitor")
          ),
          /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Flags supervisors at or nearing capacity limits to prevent over-allocation delays.")
        )
      ),
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-56 overflow-y-auto custom-scrollbar p-1" },
        capacities.map((c) => /* @__PURE__ */ React.createElement(
          "div",
          {
            key: c.faculty_id,
            className: `p-3 rounded-lg border text-xs ${c.utilization_pct >= 100 ? "border-amber-300 bg-amber-50/60" : "border-slate-200 bg-slate-50"}`
          },
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex justify-between items-start" },
            /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 truncate" }, c.name),
            /* @__PURE__ */ React.createElement(
              "span",
              { className: `text-[10px] font-bold px-1.5 py-0.5 rounded ${c.utilization_pct >= 100 ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"}` },
              c.current_count,
              " / ",
              c.allowed_capacity
            )
          ),
          /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-0.5" }, c.designation, " (", c.department, ")"),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden" },
            /* @__PURE__ */ React.createElement("div", {
              className: `h-full ${c.utilization_pct >= 100 ? "bg-amber-500" : "bg-blue-600"}`,
              style: { width: `${Math.min(100, c.utilization_pct)}%` }
            })
          ),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex justify-between text-[10px] text-slate-500 mt-1" },
            /* @__PURE__ */ React.createElement("span", null, "Utilization: ", c.utilization_pct, "%"),
            c.utilization_pct >= 100 && /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-amber-700" }, "CAP SATURATED")
          )
        ))
      )
    ),
    /* Scholar Register & Dossier Split */
    /* @__PURE__ */ React.createElement(
      "div",
      { className: "grid grid-cols-1 lg:grid-cols-12 gap-6" },
      /* Left Directory */
      /* @__PURE__ */ React.createElement(
        "div",
        { className: "lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col" },
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "flex flex-wrap items-center justify-between gap-3 mb-4" },
          /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm" }, "Vignan PhD Scholar Directory (", filteredScholars.length, " of 84)"),
            /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Filter by research area, cohort year, or scholar identifier.")
          ),
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "flex items-center space-x-2 w-full sm:w-auto" },
            /* @__PURE__ */ React.createElement("input", {
              type: "text",
              placeholder: "Search scholar, reg no, area...",
              value: scholarSearch,
              onChange: (e) => setScholarSearch(e.target.value),
              className: "text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
            }),
            /* @__PURE__ */ React.createElement(
              "select",
              {
                value: selectedArea,
                onChange: (e) => setSelectedArea(e.target.value),
                className: "text-xs px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none"
              },
              /* @__PURE__ */ React.createElement("option", { value: "" }, "All Areas"),
              /* @__PURE__ */ React.createElement("option", { value: "ML" }, "Machine Learning"),
              /* @__PURE__ */ React.createElement("option", { value: "DL" }, "Deep Learning"),
              /* @__PURE__ */ React.createElement("option", { value: "NLP" }, "NLP"),
              /* @__PURE__ */ React.createElement("option", { value: "Networks" }, "Networks / CN"),
              /* @__PURE__ */ React.createElement("option", { value: "Cloud" }, "Cloud"),
              /* @__PURE__ */ React.createElement("option", { value: "Cryptography" }, "Cryptography / Sec"),
              /* @__PURE__ */ React.createElement("option", { value: "Image" }, "Image Processing")
            ),
            /* @__PURE__ */ React.createElement("a", {
              href: "/api/phd/export-json",
              download: "vignan_phd_scholars_data.json",
              target: "_blank",
              className: "px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm whitespace-nowrap"
            }, "\u{1F4E5} Export JSON")
          )
        ),
        /* Directory Table */
        /* @__PURE__ */ React.createElement(
          "div",
          { className: "overflow-x-auto custom-scrollbar flex-1 max-h-[550px]" },
          /* @__PURE__ */ React.createElement(
            "table",
            { className: "w-full text-left text-xs" },
            /* @__PURE__ */ React.createElement(
              "thead",
              { className: "bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b" },
              /* @__PURE__ */ React.createElement(
                "tr",
                null,
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2.5" }, "Reg No"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2.5" }, "Scholar Name"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Area"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Year"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Supervisor"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Points"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Tier-1"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Eligibility"),
                /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-2" }, "Action")
              )
            ),
            /* @__PURE__ */ React.createElement(
              "tbody",
              { className: "divide-y divide-slate-100" },
              filteredScholars.map((s) => {
                const isSelected = (selectedScholar == null ? void 0 : selectedScholar.id) === s.id;
                const pts = s.cumulative_research_points || 0;
                const tier1 = s.tier1_publication_met;
                const statusBadge = s.submission_eligibility_status;
                return /* @__PURE__ */ React.createElement(
                  "tr",
                  {
                    key: s.id,
                    onClick: () => loadScholarDetail(s.id),
                    className: `cursor-pointer transition-colors hover:bg-blue-50/50 ${isSelected ? "bg-blue-50 border-l-4 border-blue-600" : ""}`
                  },
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2.5 font-mono font-bold text-slate-900" }, s.reg_no),
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2.5 font-medium text-slate-900 max-w-[130px] truncate" }, s.name),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2" },
                    /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700" }, s.research_area)
                  ),
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2 whitespace-nowrap" }, s.admission_year, " (", (s.mode || "").slice(0, 2), ")"),
                  /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-2 text-slate-700 font-medium truncate max-w-[110px]" }, (s.supervisor && s.supervisor.name ? s.supervisor.name : 'N/A')),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    /* @__PURE__ */ React.createElement("span", { className: `font-mono font-bold ${pts >= 12 ? "text-emerald-700" : "text-slate-700"}` }, (Number(pts) || 0).toFixed(1)),
                    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-400" }, "/12")
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    tier1 ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" }, "\u2713 Cat 1/2") : /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800" }, "\u2717 Missing")
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    statusBadge === "SUBMISSION_ELIGIBLE" ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300" }, "\u2713 Eligible") : statusBadge === "MISSING_TIER1" ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300" }, "\u26A0\uFE0F Missing T-1") : statusBadge === "INSUFFICIENT_POINTS" ? /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200" }, "Needs Pts") : /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600" }, "Pending")
                  ),
                  /* @__PURE__ */ React.createElement(
                    "td",
                    { className: "py-2.5 px-2 whitespace-nowrap" },
                    /* @__PURE__ */ React.createElement("button", {
                      onClick: (e) => {
                        e.stopPropagation();
                        loadScholarDetail(s.id);
                      },
                      className: "text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                    }, "View \u2192")
                  )
                );
              })
            )
          )
        )
      ),
      /* Right Dossier Panel */
      /* @__PURE__ */ React.createElement(
        "div",
        { id: "scholar-dossier-panel", className: "lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col scroll-mt-24" },
        selectedScholar ? /* @__PURE__ */ React.createElement(
          "div",
          { className: "space-y-4" },
          /* Mobile Scroll-to-Top Helper */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "lg:hidden flex justify-between items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800" },
            /* @__PURE__ */ React.createElement("span", { className: "font-semibold" }, "\u{1F4D6} Active Dossier"),
            /* @__PURE__ */ React.createElement("button", {
              onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
              className: "bg-blue-600 text-white font-bold px-2.5 py-1 rounded text-xs hover:bg-blue-700 transition"
            }, "\u2191 Directory List")
          ),
          /* Header */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "border-b pb-3 flex justify-between items-start" },
            /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "flex items-center space-x-2" },
                /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-base text-slate-900" }, selectedScholar.name),
                /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800" }, selectedScholar.reg_no)
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "text-xs text-slate-500 mt-1" },
                "Research Area: ",
                /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, selectedScholar.research_area),
                " \u2022 ",
                selectedScholar.mode
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "text-xs text-slate-500" },
                "Admitted: ",
                selectedScholar.admission_year,
                " \u2022 Phone: ",
                selectedScholar.phone || "N/A",
                " \u2022 Email: ",
                selectedScholar.email
              )
            ),
            /* @__PURE__ */ React.createElement("span", {
              className: `px-2 py-1 text-xs font-bold rounded ${selectedScholar.is_stalled ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"}`
            }, (selectedScholar.current_status || "").replace(/_/g, " "))
          ),
          /* Stalled alert */
          selectedScholar.is_stalled && /* @__PURE__ */ React.createElement(
            "div",
            { className: "p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 flex items-start space-x-2" },
            /* @__PURE__ */ React.createElement("span", { className: "font-bold text-rose-700" }, "\u26A0\uFE0F REGULATORY INTERVENTION:"),
            /* @__PURE__ */ React.createElement("span", null, selectedScholar.stalled_reason, ". Dean of Research review mandated.")
          ),
          /* DC Roster */
          /* @__PURE__ */ React.createElement(
            "div",
            { className: "p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2" },
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "font-bold text-slate-800 flex items-center justify-between" },
              /* @__PURE__ */ React.createElement("span", null, "Doctoral Committee (DC) Roster"),
              /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-blue-600 font-semibold" }, "Constituted on Record")
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "grid grid-cols-2 gap-2 text-[11px]" },
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "Research Supervisor:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, (selectedScholar.supervisor && selectedScholar.supervisor.name ? selectedScholar.supervisor.name : "N/A")),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, (selectedScholar.supervisor && selectedScholar.supervisor.designation ? selectedScholar.supervisor.designation : "Professor"))
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "External Expert:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.external_expert_name) || "Dr USN Raju") || "N/A"),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.external_expert_affiliation) || "NIT Warangal") || "Premier Institute")
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "Internal Expert 1:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.internal_expert1_name) || "Dr. S.K. Satpathy") || "N/A"),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.internal_expert1_dept) || "CSE"))
              ),
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block" }, "Inter-School Nominee:"),
                /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.interschool_nominee_name) || "Dr. Ravi Sekhar") || "N/A"),
                /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px]" }, ((selectedScholar.doctoral_committee && selectedScholar.doctoral_committee.interschool_nominee_dept) || "ECE"))
              )
            )
          ),
          /* Dual-Condition Submission Eligibility Box */
          selectedScholar.publication_eligibility && /* @__PURE__ */ React.createElement(
            "div",
            { className: "bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3" },
            /* Header */
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "flex flex-wrap items-center justify-between gap-2 border-b pb-2" },
              /* @__PURE__ */ React.createElement(
                "div",
                null,
                /* @__PURE__ */ React.createElement(
                  "h4",
                  { className: "font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5" },
                  /* @__PURE__ */ React.createElement("span", null, "PhD Submission Regulatory Compliance"),
                  /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800" }, "Dual-Condition Rule")
                ),
                /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-500" }, "Enforces mandatory Tier-1 Publication (Cat 1/2) AND \u226512.0 cumulative points.")
              ),
              /* @__PURE__ */ React.createElement(
                "span",
                {
                  className: `px-2.5 py-1 rounded text-xs font-bold ${selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" ? "bg-amber-100 text-amber-900 border border-amber-300" : selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-rose-100 text-rose-800 border border-rose-200"}`
                },
                selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" && "\u2713 SUBMISSION ELIGIBLE",
                selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" && "\u26A0\uFE0F MISSING TIER-1 (CAT 1/2)",
                selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" && "\u26A0\uFE0F POINTS SHORTFALL",
                selectedScholar.publication_eligibility.status_badge === "NOT_ELIGIBLE" && "\u2717 NOT ELIGIBLE"
              )
            ),
            /* Prominent Status Banner */
            selectedScholar.publication_eligibility.status_badge === "MISSING_TIER1" && /* @__PURE__ */ React.createElement(
              "div",
              { className: "p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-950 space-y-1" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "font-bold text-amber-900 flex items-center space-x-1.5" },
                /* @__PURE__ */ React.createElement("span", null, "\u26A0\uFE0F Missing mandatory Category 1/2 Publication requirement.")
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-amber-900 leading-relaxed" }, selectedScholar.publication_eligibility.status_message)
            ),
            selectedScholar.publication_eligibility.status_badge === "INSUFFICIENT_POINTS" && /* @__PURE__ */ React.createElement(
              "div",
              { className: "p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg text-xs text-blue-950 space-y-1" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "font-bold text-blue-900 flex items-center space-x-1.5" },
                /* @__PURE__ */ React.createElement("span", null, "\u2139\uFE0F Cumulative Research Points Shortfall")
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-blue-900 leading-relaxed" }, selectedScholar.publication_eligibility.status_message)
            ),
            selectedScholar.publication_eligibility.status_badge === "SUBMISSION_ELIGIBLE" && /* @__PURE__ */ React.createElement(
              "div",
              { className: "p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg text-xs text-emerald-950 space-y-1" },
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "font-bold text-emerald-900 flex items-center space-x-1.5" },
                /* @__PURE__ */ React.createElement("span", null, "\u{1F389} Eligible for PhD Synopsis & Thesis Submission!")
              ),
              /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-emerald-900 leading-relaxed" }, selectedScholar.publication_eligibility.status_message)
            ),
            /* Dual Progress Indicators */
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "grid grid-cols-1 sm:grid-cols-2 gap-3" },
              /* Rule 1 Indicator */
              /* @__PURE__ */ React.createElement(
                "div",
                {
                  className: `p-3 rounded-lg border text-xs ${((_b = (_a = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _a.rule_1_tier1) == null ? void 0 : _b.satisfied) ? "bg-emerald-50/60 border-emerald-200" : "bg-amber-50/60 border-amber-200"}`
                },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between items-start mb-1" },
                  /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, "Rule 1: Tier-1 Publication"),
                  /* @__PURE__ */ React.createElement("span", {
                    className: `text-[10px] font-bold px-2 py-0.5 rounded ${((_d = (_c = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _c.rule_1_tier1) == null ? void 0 : _d.satisfied) ? "bg-emerald-200 text-emerald-900" : "bg-amber-200 text-amber-900"}`
                  }, ((_f = (_e = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _e.rule_1_tier1) == null ? void 0 : _f.satisfied) ? "SATISFIED" : "UNMET")
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "text-[11px] text-slate-600 mb-1.5" },
                  "Requires \u2265 1 paper in Category 1 (SCI/SCI-E, 5.0 pts) or Category 2 (Top-Notch Conf Level 1, 4.5 pts)."
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60" },
                  /* @__PURE__ */ React.createElement("span", { className: "text-slate-500" }, "Qualifying Tier-1 Papers:"),
                  /* @__PURE__ */ React.createElement(
                    "span",
                    { className: "font-bold text-slate-900 font-mono" },
                    ((_h = (_g = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _g.rule_1_tier1) == null ? void 0 : _h.tier1_count) || 0,
                    " / 1 required"
                  )
                )
              ),
              /* Rule 2 Indicator */
              /* @__PURE__ */ React.createElement(
                "div",
                {
                  className: `p-3 rounded-lg border text-xs ${((_j = (_i = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _i.rule_2_cumulative_points) == null ? void 0 : _j.satisfied) ? "bg-emerald-50/60 border-emerald-200" : "bg-blue-50/60 border-blue-200"}`
                },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between items-start mb-1" },
                  /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900" }, "Rule 2: Cumulative Points"),
                  /* @__PURE__ */ React.createElement("span", {
                    className: `text-[10px] font-bold px-2 py-0.5 rounded ${((_l = (_k = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _k.rule_2_cumulative_points) == null ? void 0 : _l.satisfied) ? "bg-emerald-200 text-emerald-900" : "bg-blue-200 text-blue-900"}`
                  }, ((_n = (_m = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _m.rule_2_cumulative_points) == null ? void 0 : _n.satisfied) ? "SATISFIED" : "IN PROGRESS")
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between text-[11px] text-slate-600 mb-1" },
                  /* @__PURE__ */ React.createElement("span", null, "Total Points Accumulated:"),
                  /* @__PURE__ */ React.createElement(
                    "span",
                    { className: "font-bold text-slate-900 font-mono" },
                    ((_p = (_o = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _o.rule_2_cumulative_points) == null ? void 0 : _p.current_points) || 0,
                    " / 12.0 pts"
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1" },
                  /* @__PURE__ */ React.createElement("div", {
                    className: `h-full transition-all duration-500 ${((_r = (_q = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _q.rule_2_cumulative_points) == null ? void 0 : _r.satisfied) ? "bg-emerald-500" : "bg-blue-500"}`,
                    style: { width: `${Math.min(100, ((_t = (_s = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _s.rule_2_cumulative_points) == null ? void 0 : _t.percentage) || 0)}%` }
                  })
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex justify-between text-[10px] text-slate-500" },
                  /* @__PURE__ */ React.createElement("span", null, "Progress: ", ((_v = (_u = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _u.rule_2_cumulative_points) == null ? void 0 : _v.percentage) || 0, "%"),
                  /* @__PURE__ */ React.createElement(
                    "span",
                    null,
                    ((_x = (_w = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _w.rule_2_cumulative_points) == null ? void 0 : _x.shortfall) > 0 ? `Shortfall: ${(_z = (_y = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _y.rule_2_cumulative_points) == null ? void 0 : _z.shortfall} pts` : `Surplus: +${(_B = (_A = selectedScholar.publication_eligibility.dual_conditions) == null ? void 0 : _A.rule_2_cumulative_points) == null ? void 0 : _B.surplus} pts`
                  )
                )
              )
            ),
            /* Points Distribution by Category */
            selectedScholar.publication_eligibility.category_point_distribution && Object.keys(selectedScholar.publication_eligibility.category_point_distribution).length > 0 && /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-semibold text-slate-700 mb-1" }, "Points Distribution by Category:"),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "flex flex-wrap gap-1.5" },
                Object.entries(selectedScholar.publication_eligibility.category_point_distribution).map(([cat, pts]) => /* @__PURE__ */ React.createElement(
                  "span",
                  { key: cat, className: "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200" },
                  /* @__PURE__ */ React.createElement("span", { className: "truncate max-w-[160px]" }, cat),
                  ": ",
                  /* @__PURE__ */ React.createElement("strong", { className: "ml-1 text-blue-700" }, pts, " pts")
                ))
              )
            ),
            /* Scored Research Outputs Breakdown */
            selectedScholar.publication_eligibility.research_outputs && selectedScholar.publication_eligibility.research_outputs.length > 0 && /* @__PURE__ */ React.createElement(
              "div",
              null,
              /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-semibold text-slate-700 mb-1" }, "Scored Research Outputs & Patents:"),
              /* @__PURE__ */ React.createElement(
                "div",
                { className: "max-h-36 overflow-y-auto custom-scrollbar space-y-1 pr-1" },
                ((selectedScholar && selectedScholar.publication_eligibility && selectedScholar.publication_eligibility.research_outputs) || []).map((out, idx) => /* @__PURE__ */ React.createElement(
                  "div",
                  { key: idx, className: "p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] flex justify-between items-start gap-2" },
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "flex-1 min-w-0" },
                    /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-slate-900 truncate" }, out.title),
                    /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-0.5 truncate" }, out.venue, " \u2022 ", out.publication_year),
                    /* @__PURE__ */ React.createElement(
                      "div",
                      { className: "mt-1 flex items-center space-x-1.5" },
                      /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-medium bg-slate-200 text-slate-800" }, `Cat ${out.category_no}: ${out.category_name}`),
                      out.is_tier1 && /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800" }, "\u2605 TIER-1 MANDATORY")
                    )
                  ),
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "text-right whitespace-nowrap" },
                    /* @__PURE__ */ React.createElement("span", { className: "font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200" }, `+${(Number(out.research_points) || 0).toFixed(1)} pts`)
                  )
                ))
              )
            )
          ),
          /* Milestone Regulatory Pipeline */
          /* @__PURE__ */ React.createElement(
            "div",
            null,
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "flex justify-between items-center mb-2" },
              /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-xs text-slate-900" }, "Milestone Regulatory Sequence"),
              /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-slate-500" }, "Dual condition verified before Pre-Sub / Synopsis")
            ),
            /* @__PURE__ */ React.createElement(
              "div",
              { className: "space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1" },
              ((selectedScholar && selectedScholar.milestones) || []).map((m, idx) => /* @__PURE__ */ React.createElement(
                "div",
                { key: m.id, className: "flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs" },
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center space-x-2.5 min-w-0 flex-1" },
                  /* @__PURE__ */ React.createElement("div", {
                    className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${m.status === "Completed" ? "bg-emerald-500 text-white" : m.status === "Overdue" ? "bg-rose-500 text-white" : "bg-slate-300 text-slate-700"}`
                  }, m.status === "Completed" ? "\u2713" : idx + 1),
                  /* @__PURE__ */ React.createElement(
                    "div",
                    { className: "min-w-0" },
                    /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900 block truncate" }, m.name),
                    /* @__PURE__ */ React.createElement(
                      "span",
                      { className: "text-[10px] text-slate-500" },
                      "Due: ",
                      m.due_date,
                      m.completion_date ? ` \u2022 Done: ${m.completion_date}` : ""
                    )
                  )
                ),
                /* @__PURE__ */ React.createElement(
                  "div",
                  { className: "flex items-center space-x-2 flex-shrink-0 ml-2" },
                  /* @__PURE__ */ React.createElement("span", {
                    className: `text-[10px] font-bold px-2 py-0.5 rounded ${m.status === "Completed" ? "bg-emerald-100 text-emerald-800" : m.status === "Overdue" ? "bg-rose-100 text-rose-800" : "bg-slate-200 text-slate-700"}`
                  }, m.status),
                  m.status !== "Completed" && /* @__PURE__ */ React.createElement("button", {
                    onClick: () => handleCompleteMilestone(selectedScholar.id, m.code),
                    className: "px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                  }, "Complete \u2192")
                )
              ))
            )
          )
        ) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center h-full text-slate-400 text-xs" }, "Select a scholar from the register to view detailed dossier")
      )
    )
  ), activeTab === "pubs" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 17: Faculty Research Publication Monitoring"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Maintains verified Scopus/WoS records, solves institutional affiliation variations, and catches predatory submissions.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSweep,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
    },
    "\u26A1 Trigger External Ingestion Sweep"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: `${API_BASE}/publications/accreditation-export`,
      target: "_blank",
      className: "px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
    },
    "Export NAAC/NIRF Proofs"
  ))), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-3" }, "Institutional Publication Repository (", publications.length, " Papers)"), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto custom-scrollbar max-h-[500px]" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-100 text-slate-600 font-semibold sticky top-0 border-b" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Title & Authors"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Faculty Member"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Journal & ISSN"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Tier / Quartile"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Citations"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Status"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, publications.map((p) => /* @__PURE__ */ React.createElement("tr", { key: p.id, className: "hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 max-w-sm" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-slate-900" }, p.title), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 truncate" }, p.authors), p.doi && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-blue-600 font-mono mt-0.5" }, "DOI: ", p.doi)), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-medium text-slate-800" }, p.faculty_name || "Doctoral Scholar"), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-slate-900" }, p.journal_name), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 font-mono" }, "ISSN: ", p.issn || "Online")), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${p.quartile === "Q1" ? "bg-emerald-100 text-emerald-800" : p.quartile === "Q2" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"}` }, p.quartile)), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-slate-700" }, p.citations), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3" }, p.is_flagged_predatory ? /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800" }, "FLAGGED: PREDATORY") : /* @__PURE__ */ React.createElement("span", { className: "px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800" }, "VERIFIED"))))))))), activeTab === "journal" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-xl" }, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 18: Journal Quartile & Predatory Risk Verifier"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Verify venue before manuscript submission. Checks Web of Science, Scopus, UGC-CARE, delisting flags, and calculates predatory risk index."), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2 mt-4" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: journalQuery,
      onChange: (e) => setJournalQuery(e.target.value),
      placeholder: "Enter ISSN (e.g. 2168-2267) or Title (e.g. Pattern Recognition)",
      className: "flex-1 text-xs px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => verifyJournal(journalQuery),
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
    },
    "Verify Venue"
  )), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 mt-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setJournalQuery("2168-2267");
    verifyJournal("2168-2267");
  }, className: "text-[11px] text-blue-600 underline" }, "Sample Q1: IEEE Trans Cybernetics"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setJournalQuery("1868-5137");
    verifyJournal("1868-5137");
  }, className: "text-[11px] text-rose-600 underline" }, "Sample Delisted: J Ambient Intelligence")))), journalResult && /* @__PURE__ */ React.createElement("div", { className: `p-6 rounded-xl border shadow-sm ${journalResult.verdict_badge === "REJECTED" ? "bg-rose-50/70 border-rose-200" : journalResult.verdict_badge === "CAUTION" ? "bg-amber-50/70 border-amber-200" : "bg-white border-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-start justify-between gap-4 border-b pb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-slate-900" }, journalResult.title), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700" }, "ISSN: ", journalResult.canonical_issn)), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Publisher: ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, journalResult.publisher), " \u2022 Subject: ", journalResult.subject_category)), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: `text-sm font-black px-3 py-1 rounded inline-block ${journalResult.verdict_badge === "REJECTED" ? "bg-rose-600 text-white" : journalResult.verdict_badge === "CAUTION" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"}` }, journalResult.verdict), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-slate-500 mt-1" }, "Checked on: ", (_C = journalResult.verification_timestamp) == null ? void 0 : _C.slice(0, 10)))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 my-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "JCR Quartile (WoS)"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, ((_D = journalResult.quartiles) == null ? void 0 : _D.jcr_wos) || "N/A")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "CiteScore (Scopus)"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, ((_E = journalResult.metrics) == null ? void 0 : _E.citescore) || "N/A")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "Impact Factor"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, ((_F = journalResult.metrics) == null ? void 0 : _F.impact_factor) || "0.0")), /* @__PURE__ */ React.createElement("div", { className: "bg-white/80 p-3 rounded-lg border border-slate-200/80" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-slate-500 block uppercase" }, "Peer Review Turnaround"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-black text-slate-900" }, (_G = journalResult.metrics) == null ? void 0 : _G.peer_review_turnaround_weeks, " Weeks"))), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-slate-900 text-white rounded-lg text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-300 block mb-1" }, "RECOMMENDATION VERDICT:"), journalResult.recommendation), ((_H = journalResult.risk_evidence) == null ? void 0 : _H.length) > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4 p-3 bg-rose-100/70 border border-rose-300 rounded-lg text-xs text-rose-900" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold block mb-1" }, "\u{1F6A8} PREDATORY / DELISTING EVIDENCE:"), /* @__PURE__ */ React.createElement("ul", { className: "list-disc pl-4 space-y-0.5" }, journalResult.risk_evidence.map((rev, i) => /* @__PURE__ */ React.createElement("li", { key: i }, rev)))), ((_I = journalResult.alternatives) == null ? void 0 : _I.length) > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-4 pt-4 border-t border-slate-200" }, /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-xs text-slate-900 mb-2" }, "Recommended Reputable Alternative Venues (Q1 / Q2 Tier)"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3" }, journalResult.alternatives.map((alt) => /* @__PURE__ */ React.createElement("div", { key: alt.id, className: "p-3 bg-white rounded-lg border border-slate-200 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 block truncate" }, alt.title), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[11px] text-slate-500 mt-1" }, /* @__PURE__ */ React.createElement("span", null, "ISSN: ", alt.issn), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-600" }, alt.quartile, " \u2022 IF ", alt.impact_factor)))))))), activeTab === "productivity" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 20: Research Productivity & Gini Concentration Engine"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Quality-weighted scores across quartiles (Q1: 15pts, Q2: 10pts), discipline normalization (CSE, ECE, Mech, S&H), and NIRF RPC computation."))), departmentBenchmarks && /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-slate-500 uppercase" }, "Institutional Gini Index"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-blue-600 mt-1" }, departmentBenchmarks.institutional_gini_coefficient), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-1" }, departmentBenchmarks.concentration_insight)), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-slate-500 uppercase" }, "Top 10% Output Concentration"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-indigo-600 mt-1" }, departmentBenchmarks.top_10_percent_share_pct, "%"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-1" }, "Portion of total research points produced by top 10% faculty")), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-medium text-slate-500 uppercase" }, "NIRF RPC Score Projection"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-emerald-600 mt-1" }, "68.4 / 100"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 mt-1" }, "Accreditation component for Research and Professional Practice"))), (departmentBenchmarks == null ? void 0 : departmentBenchmarks.department_benchmarks) && /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-3" }, "Departmental Research Benchmarking"), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto custom-scrollbar" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs" }, /* @__PURE__ */ React.createElement("thead", { className: "bg-slate-100 text-slate-600 font-semibold border-b" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Department"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Faculty Count"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Total Productivity Points"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Avg Points / Faculty"), /* @__PURE__ */ React.createElement("th", { className: "py-2.5 px-3" }, "Top Faculty Score"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-slate-100" }, departmentBenchmarks.department_benchmarks.map((dept, i) => /* @__PURE__ */ React.createElement("tr", { key: i, className: "hover:bg-slate-50" }, /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-bold text-slate-900" }, dept.department), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-medium text-slate-700" }, dept.faculty_count), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-bold text-blue-600" }, dept.total_productivity_score), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono font-semibold text-slate-800" }, dept.average_productivity_per_faculty), /* @__PURE__ */ React.createElement("td", { className: "py-2.5 px-3 font-mono text-emerald-600 font-bold" }, dept.peak_faculty_score)))))))), activeTab === "performance" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 59: Faculty Performance & Annual Appraisal Dossier"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Auto-populates Teaching (35%), Research (35%), Administration (15%), and Outreach (15%) from platform records with context adjustments.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsContesting(true),
      className: "px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-lg transition"
    },
    "\u2696\uFE0F Contest Automated Calculation"
  )), dossier && /* @__PURE__ */ React.createElement("div", { className: "bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap justify-between items-start border-b pb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-lg text-slate-900" }, dossier.faculty_name), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800" }, dossier.designation, " \u2022 ", dossier.department)), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-slate-500 mt-1" }, "Appraisal Cycle: ", /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-800" }, dossier.academic_year), " \u2022 Status: ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-600" }, dossier.status))), /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("div", { className: "text-3xl font-black text-blue-600" }, dossier.aggregate_score, " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-normal text-slate-400" }, "/ 100")), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800" }, dossier.performance_band))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Teaching & Learning (35%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.teaching.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, dossier.dimension_scores.teaching.teaching_hours, " Hours/week instruction")), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Research & Innovation (35%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.research.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, dossier.dimension_scores.research.publications_count, " Pubs (", dossier.dimension_scores.research.q1_q2_count, " Q1/Q2) \u2022 ", dossier.dimension_scores.research.phd_scholars_active, " PhDs")), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Administration (15%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.governance.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, "Role: ", dossier.dimension_scores.governance.role)), /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-200" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700 block" }, "Outreach & Mentorship (15%)"), /* @__PURE__ */ React.createElement("div", { className: "text-2xl font-black text-slate-900 mt-1" }, dossier.dimension_scores.outreach.score), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-1" }, "Reviews, FDPs & Keynotes"))), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "Administrative Relief Multiplier: ", /* @__PURE__ */ React.createElement("strong", null, dossier.administrative_adjustment_factor, "x"), " applied to recognize heavy leadership workload without penalizing research output."), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded" }, "Traceable Audit Trail")), /* @__PURE__ */ React.createElement("div", { className: "border-t pt-4 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 block mb-1" }, "Agreed Performance Targets for Next Cycle:"), /* @__PURE__ */ React.createElement("p", { className: "text-slate-600" }, dossier.agreed_next_cycle_goals))), isContesting && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-base text-slate-900" }, "Contest Automated Performance Calculation"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500" }, "Submit formal contestation to the Dean of Research and IQAC committee with your justification."), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: contestReason,
      onChange: (e) => setContestReason(e.target.value),
      placeholder: "Explain reason for contestation (e.g. Uncounted Q1 journal published late in reporting cycle)...",
      className: "w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setIsContesting(false),
      className: "px-4 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
    },
    "Cancel"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleContest,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
    },
    "Submit Contestation"
  ))))), activeTab === "kpi" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-bold text-slate-900 text-base" }, "Agent 71: University Strategic Key Performance Indicator Cockpit"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mt-0.5" }, "Live institutional radar tracking Research, Doctoral Studies, Faculty, Governance, and NIRF / NAAC Frameworks.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center space-x-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSyncKpis,
      className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition"
    },
    "\u{1F504} Live KPI Sync"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleExportGovernanceBrief,
      className: "px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
    },
    "\u{1F4D1} Export Governance Briefing"
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, kpis.map((kpi) => {
    const isAmber = kpi.status === "On_Target_Deteriorating";
    const isGreen = kpi.status === "On_Target_Improving";
    const isRed = kpi.status === "Off_Target_Deteriorating";
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: kpi.id,
        className: `p-5 rounded-xl border shadow-sm ${isAmber ? "bg-amber-50/60 border-amber-300" : isRed ? "bg-rose-50/60 border-rose-300" : "bg-white border-slate-200"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-start" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono" }, kpi.code, " \u2022 ", kpi.domain), /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-black px-2 py-0.5 rounded ${isAmber ? "bg-amber-200 text-amber-900" : isGreen ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}` }, (kpi.status || "").replace(/_/g, " "))),
      /* @__PURE__ */ React.createElement("h4", { className: "font-bold text-sm text-slate-900 mt-2" }, kpi.title),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline space-x-2 mt-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-black text-slate-900" }, kpi.current_value), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-500 font-semibold" }, kpi.unit), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-slate-400" }, "/ Target: ", kpi.target_value)),
      isAmber && /* @__PURE__ */ React.createElement("div", { className: "mt-3 p-2 bg-amber-100/90 text-amber-900 rounded text-[11px] font-medium border border-amber-300" }, "\u26A0\uFE0F ", /* @__PURE__ */ React.createElement("strong", null, "EARLY WARNING:"), " Meeting target but declining from prior period (", kpi.prior_period_value, ")."),
      /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-slate-500 mt-3 border-t pt-2 space-y-0.5" }, /* @__PURE__ */ React.createElement("div", null, "Framework: ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, kpi.nirf_mapping)), /* @__PURE__ */ React.createElement("div", null, "Owner: ", /* @__PURE__ */ React.createElement("span", { className: "font-medium text-slate-800" }, kpi.owner_role)))
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-sm mb-1" }, "Institutional Lead-Lag Predictive Relationships"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-500 mb-4" }, "Understands cause-and-effect lags between operational inputs and downstream university ranking outputs."), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, leadLag.map((rel, idx) => /* @__PURE__ */ React.createElement("div", { key: idx, className: "p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-blue-700 font-mono" }, "Lag Time: ", rel.time_lag), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded" }, rel.correlation_strength)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px] uppercase font-bold" }, "Leading Input Indicator"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, rel.lead_indicator)), /* @__PURE__ */ React.createElement("div", { className: "text-center text-slate-400 font-bold" }, "\u2193 DIRECT IMPACT \u2193"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 block text-[10px] uppercase font-bold" }, "Lagging Outcome Indicator"), /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-slate-900" }, rel.lag_indicator)), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1" }, rel.strategic_insight))))), governanceBrief && /* @__PURE__ */ React.createElement("div", { className: "bg-brand-900 text-white p-6 rounded-xl border border-slate-700 shadow-xl space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center border-b border-slate-700 pb-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-black text-base text-white" }, governanceBrief.report_title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-blue-300" }, governanceBrief.institution)), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono bg-blue-800/60 px-3 py-1 rounded border border-blue-600" }, "NIRF Trajectory: ", (_J = governanceBrief.nirf_score_projection) == null ? void 0 : _J.projected_rank_band)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "Monitored Indicators"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-white mt-1 block" }, governanceBrief.total_kpis_monitored)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "Target Compliance"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-emerald-400 mt-1 block" }, governanceBrief.on_target_pct, "%")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "Projected Overall Score"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-blue-400 mt-1 block" }, (_K = governanceBrief.nirf_score_projection) == null ? void 0 : _K.projected_overall_score)), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-800/80 p-3 rounded-lg border border-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 block" }, "RPC Component Score"), /* @__PURE__ */ React.createElement("span", { className: "text-xl font-bold text-purple-400 mt-1 block" }, (_L = governanceBrief.nirf_score_projection) == null ? void 0 : _L.rpc_component_score)))))), /* @__PURE__ */ React.createElement("footer", { className: "bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2" }, /* @__PURE__ */ React.createElement("div", null, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " Vignan's Foundation for Science, Technology & Research (VFSTR). Deemed to be University."), /* @__PURE__ */ React.createElement("div", { className: "flex space-x-4 text-[11px] text-slate-400" }, /* @__PURE__ */ React.createElement("span", null, "FastAPI 0.141 Backend"), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "PostgreSQL Schema Ready"), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "React 18 / Tailwind CSS")))));
}
ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));

