import json
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models import (
    Department, Faculty, PhDScholar, DoctoralCommittee, PhDMilestone,
    DoctoralCommitteeReview, Journal, AuthorIdentifier, AffiliationVariant,
    Publication, FacultyCitationTrend, ResearchProductivityScorecard,
    AppraisalRubric, AppraisalDossier, UniversityKPI
)
from backend.app.agents.agent_phd_monitoring import PhDMonitoringAgent

# Raw 84 scholars dataset provided by user
RAW_SCHOLARS = [
    {"sno": 1, "reg_no": "141PG04204", "name": "Cmak Zeelan Basha", "area": "ML", "year": 2014, "phone": "7981988298", "email": "cmak.zeelan@gmail.com", "sup": "Dr. S. V. Phani Kumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9912514034", "sup_mail": "drsvpk_cse@vignan.ac.in", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9440149146", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. S.K. Satpathy", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9179087666", "int1_mail": "drsks_cse@vignan.ac.in", "int2_name": "Dr. N. Veeranjaneyulu", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9347162038", "int2_mail": "drnvn_it@vignan.ac.in"},
    {"sno": 2, "reg_no": "171FG04005", "name": "Deepika Nalabala", "area": "ML", "year": 2017, "phone": "9502831857", "email": "deepika.kitss@gmail.com", "sup": "Dr. M. Nirupama Bhat", "desig": "Professor", "dept": "CSE", "sup_phone": "9908823834", "sup_mail": "drmnb_cse@vignan.ac.in", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. S. Balakrishna", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9441540580", "int1_mail": "sbk_cse@vignan.ac.in", "int2_name": "Dr. B. Premamayudu", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9440006478", "int2_mail": "drbpm_it@vignan.ac.in"},
    {"sno": 3, "reg_no": "181PG04201", "name": "Anandha Kumar D", "area": "ML", "year": 2018, "phone": "9245315532", "email": "anandhakumardharmalingam@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. Lam Suvarna Raju", "int2_desig": "Professor", "int2_dept": "Mech", "int2_phone": "9182481022", "int2_mail": "hodmech@vignan.ac.in"},
    {"sno": 4, "reg_no": "181PG04202", "name": "T.V.Vamsi Krishna", "area": "ML", "year": 2018, "phone": "7989162614", "email": "vamsi.jan13@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. K. Sujatha", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9440006478", "int2_mail": "drbpm_it@vignan.ac.in"},
    {"sno": 5, "reg_no": "191PG04001", "name": "Naga Durga Saile K", "area": "ML", "year": 2019, "phone": "6300266141", "email": "saileknd3@gmail.com", "sup": "Dr. S. V. Phani Kumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9912514034", "sup_mail": "drsvpk_cse@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. Satish Kumar Satti", "int1_desig": "Asst Prof", "int1_dept": "CSE", "int1_phone": "9581236143", "int1_mail": "sskumar_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 6, "reg_no": "191PG04003", "name": "R Veera Babu", "area": "ML", "year": 2019, "phone": "7989163034", "email": "veerababureddy@gmail.com", "sup": "Dr. N. Veeranjaneyulu", "desig": "Professor", "dept": "IT", "sup_phone": "9347162038", "sup_mail": "drnvn_it@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. S. Devakumar", "int1_desig": "Assoc. Prof", "int1_dept": "CSE", "int1_phone": "9959949221", "int1_mail": "sdk_cse@vignan.ac.in", "int2_name": "Dr. M. Sharada", "int2_desig": "Professor", "int2_dept": "ECE", "int2_phone": "9441227700", "int2_mail": "drms_ece@vignan.ac.in"},
    {"sno": 7, "reg_no": "191PG04005", "name": "Syed Shareefunnisa", "area": "ML, NLP", "year": 2019, "phone": "8074308730", "email": "syedshareefa@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. N. Usha Rani", "int2_desig": "Professor", "int2_dept": "ECE", "int2_phone": "9440020660", "int2_mail": "drnur_ece@vignan.ac.in"},
    {"sno": 8, "reg_no": "191PG04006", "name": "Sajja Radha Rani", "area": "ML, NLP", "year": 2019, "phone": "9493670612", "email": "radharani.sajja6@gmail.com", "sup": "Dr. S. V. Phani Kumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9912514034", "sup_mail": "drsvpk_cse@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. K. Sujatha", "int2_desig": "Asso.Professor", "int2_dept": "IT", "int2_phone": "9989728642", "int2_mail": "drks_it@vignan.ac.in"},
    {"sno": 9, "reg_no": "191PG04010", "name": "J.Dayanika", "area": "ML", "year": 2019, "phone": "7013447336", "email": "dayanika.jarugumalla@gmail.com", "sup": "Dr. S. Bala Krishna", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9441540580", "sup_mail": "sbk_cse@vignan.ac.in", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. U. Sri Lakshmi", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "8121813525", "int1_mail": "usl_cse@vignan.ac.in", "int2_name": "Dr. Jakeer Hussain", "int2_desig": "Professor", "int2_dept": "ECE", "int2_phone": "9866875459", "int2_mail": "drskjh_ece@vignan.ac.in"},
    {"sno": 10, "reg_no": "191PG04201", "name": "Patil Kiran Hilal", "area": "ML", "year": 2019, "phone": "7893566204", "email": "patilk2008@gmail.com", "sup": "Dr. M. Nirupama Bhat", "desig": "Professor", "dept": "CSE", "sup_phone": "9908823834", "sup_mail": "drmnb_cse@vignan.ac.in", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9440149146", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. U. Sri Lakshmi", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "8121813525", "int1_mail": "usl_cse@vignan.ac.in", "int2_name": "Dr. Annapurna K", "int2_desig": "Asso.Professor", "int2_dept": "ECE", "int2_phone": "9966426477", "int2_mail": "drka_ece@vignan.ac.in"},
    {"sno": 11, "reg_no": "191PG04204", "name": "Nazma Sultana Shaik", "area": "ML", "year": 2019, "phone": "9100844780", "email": "nazma.cs@gmail.com", "sup": "Dr. Hemanta Kumar Bhuyan", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8333093453", "sup_mail": "hmb.bhuyan@gmail.com", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. S.K. Satpathy", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9179087666", "int1_mail": "drsks_cse@vignan.ac.in", "int2_name": "Dr. Seetharamanjaneya Reddy", "int2_desig": "Professor", "int2_dept": "ECE", "int2_phone": "9491338857", "int2_mail": "drgsr_ece@vignan.ac.in"},
    {"sno": 12, "reg_no": "191PG04205", "name": "S Nyamathulla", "area": "ML", "year": 2019, "phone": "9885423099", "email": "nyamath.j@gmail.com", "sup": "Dr. N. Veeranjaneyulu", "desig": "Professor", "dept": "IT", "sup_phone": "9347162038", "sup_mail": "drnvn_it@vignan.ac.in", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. S.K. Satpathy", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "9179087666", "int1_mail": "drsks_cse@vignan.ac.in", "int2_name": "Dr. Venkata Reddy", "int2_desig": "Assoc Prof", "int2_dept": "ECE", "int2_phone": "9440123456", "int2_mail": "drvr_ece@vignan.ac.in"},
    {"sno": 13, "reg_no": "191PG04207", "name": "Naga Sudheer Bandlamudi", "area": "ML", "year": 2019, "phone": "9346727904", "email": "sudheer.bandlamudi44@gmail.com", "sup": "Dr. K. Sujatha", "desig": "Associate Professor", "dept": "IT", "sup_phone": "9989728642", "sup_mail": "drks_it@vignan.ac.in", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. U. Sri Lakshmi", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "8121813525", "int1_mail": "usl_cse@vignan.ac.in", "int2_name": "Dr. Ravi Sekhar", "int2_desig": "Professor", "int2_dept": "ECE", "int2_phone": "9243440775", "int2_mail": "yrs_ece@vignan.ac.in"},
    {"sno": 14, "reg_no": "191PG04208", "name": "Avvaru R V Naga Suneetha", "area": "ML", "year": 2019, "phone": "8919366442", "email": "suneethaavvaru@gmail.com", "sup": "Dr. K. Sujatha", "desig": "Associate Professor", "dept": "IT", "sup_phone": "9989728642", "sup_mail": "drks_it@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. U. Sri Lakshmi", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "8121813525", "int1_mail": "usl_cse@vignan.ac.in", "int2_name": "Dr. S. Hanumantha Rao", "int2_desig": "Asso.Professor", "int2_dept": "S & H", "int2_phone": "9441536410", "int2_mail": "sama.hanumantharao@gmail.com"},
    {"sno": 15, "reg_no": "201PG04001", "name": "Jallipally Himabindu", "area": "IAC", "year": 2020, "phone": "9346530034", "email": "jhimabindu_it@mgit.ac.in", "sup": "Dr. M. Umadevi", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9603329592", "sup_mail": "druma_cse@vignan.ac.in", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. P. Sivaprasad", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9000443503", "int1_mail": "psp_cse@vignan.ac.in", "int2_name": "Dr. S. Bala Krishna", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9440006478", "int2_mail": "drbpm_it@vignan.ac.in"},
    {"sno": 16, "reg_no": "201PG04002", "name": "Naga Sujini Ganne", "area": "ML, NLP", "year": 2020, "phone": "9885923464", "email": "gnagasujini_cse@mgit.ac.in", "sup": "Dr. S. Bala Krishna", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9441540580", "sup_mail": "sbk_cse@vignan.ac.in", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. D. Radha Rani", "int1_desig": "Asso.Professor", "int1_dept": "CSE", "int1_phone": "9676354404", "int1_mail": "drr_cse@vignan.ac.in", "int2_name": "Dr. P. Subba Rao", "int2_desig": "Asso.Professor", "int2_dept": "IT", "int2_phone": "8977178466", "int2_mail": "drpsr_it@vignan.ac.in"},
    {"sno": 17, "reg_no": "211PG04001", "name": "Mary Margarat Valentine Neela", "area": "ML", "year": 2021, "phone": "9619903582", "email": "marym.neela@gmail.com", "sup": "Dr. P. Subba Rao", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8977178466", "sup_mail": "drpsr_it@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "9247465125", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. U. Sri Lakshmi", "int1_desig": "Asso.Prof", "int1_dept": "CSE", "int1_phone": "8121813525", "int1_mail": "usl_cse@vignan.ac.in", "int2_name": "Dr. B. Premamayudu", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9440006478", "int2_mail": "drbpm_it@vignan.ac.in"},
    {"sno": 18, "reg_no": "211PG04201", "name": "Srinivas Komati", "area": "Networks/security", "year": 2021, "phone": "9908274030", "email": "srinivas.kmt@gmail.com", "sup": "Dr. D. Radha Rani", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9676354404", "sup_mail": "drr_cse@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "8332969418", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. A Avinash Reddy", "int1_desig": "Asst. Prof", "int1_dept": "CSE", "int1_phone": "8890528683", "int1_mail": "aar_cse@vignan.ac.in", "int2_name": "Dr. B. Premamayudu", "int2_desig": "Professor", "int2_dept": "IT", "int2_phone": "9440006478", "int2_mail": "drbpm_it@vignan.ac.in"},
    {"sno": 19, "reg_no": "221FG04001", "name": "Uttej Kumar Nannapaneni", "area": "Networks", "year": 2022, "phone": "9573793892", "email": "uttejkumar171f18@gmail.com", "sup": "Dr. D. Radha Rani", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9676354404", "sup_mail": "drr_cse@vignan.ac.in", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 20, "reg_no": "221FG04002", "name": "Chaparala Pushya", "area": "Machine learning", "year": 2022, "phone": "9989620706", "email": "pushyachaparala@gmail.com", "sup": "Dr. P. Nagabhushan", "desig": "Professor", "dept": "CSE", "sup_phone": "9448051551", "sup_mail": "pnagabhushan@hotmail.com", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. P. Nagabhusan", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9448051551", "int1_mail": "vc@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 21, "reg_no": "221FG04003", "name": "Anusha Viswanadapalli", "area": "Networks", "year": 2022, "phone": "9704754065", "email": "anusha6785@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9494451255", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 22, "reg_no": "221PG04001", "name": "Kukutla Alekhya", "area": "Networks", "year": 2022, "phone": "9063964613", "email": "kukutlaalekhya@gmail.com", "sup": "Dr. D. Radha Rani", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9676354404", "sup_mail": "drr_cse@vignan.ac.in", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9494451255", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 23, "reg_no": "221FG04004", "name": "Anusha Kakumanu", "area": "Machine learning", "year": 2022, "phone": "7799053996", "email": "anu.kakumanu@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9494451255", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 24, "reg_no": "221FG04005", "name": "D Bala Kotaiah", "area": "Networks", "year": 2022, "phone": "9059093829", "email": "dsbalu57@gmail.com", "sup": "Dr. D. Radha Rani", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9676354404", "sup_mail": "drr_cse@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 25, "reg_no": "221FG04006", "name": "D.Likhitha", "area": "Machine learning", "year": 2022, "phone": "9573039646", "email": "likhithadulla9@gmail.com", "sup": "Dr. S. V. Phani Kumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9912514034", "sup_mail": "drsvpk_cse@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "9247465125", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 26, "reg_no": "221FG04008", "name": "Ugge Naga Nandini", "area": "N/w,Security", "year": 2022, "phone": "7995622962", "email": "nandininaga21@gmail.com", "sup": "Dr. M. Nirupama Bhat", "desig": "Professor", "dept": "CSE", "sup_phone": "9908823834", "sup_mail": "drmnb_cse@vignan.ac.in", "ext_name": "Dr. R. Ranjan Routh", "ext_affil": "NIT Warangal", "ext_phone": "8332969418", "ext_mail": "rashrr@nitw.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 27, "reg_no": "221PG04005", "name": "Yalamandeswara Rao Gumma", "area": "CN", "year": 2023, "phone": "9502839254", "email": "gumma.eswar@gmail.com", "sup": "Dr. P. Subba Rao", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8977178466", "sup_mail": "drpsr_it@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 28, "reg_no": "221PG04006", "name": "V Abraham Prasanna Kumar", "area": "CN", "year": 2023, "phone": "9000180091", "email": "varadhiprasanna@gmail.com", "sup": "Dr. D. Radha Rani", "desig": "Associate Professor", "dept": "ACSE", "sup_phone": "9676354404", "sup_mail": "drr_cse@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 29, "reg_no": "221PG04008", "name": "Sharmila Devi Mandalapu", "area": "CN", "year": 2023, "phone": "8074150588", "email": "msr4104@gmail.com", "sup": "Dr. D. Radha Rani", "desig": "Associate Professor", "dept": "ACSE", "sup_phone": "9676354404", "sup_mail": "drr_cse@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 30, "reg_no": "221PG04009", "name": "Swarajya Lakshmi B", "area": "DL", "year": 2023, "phone": "8106939478", "email": "lakshmi.jun@gmail.com", "sup": "Dr. M. Umadevi", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9603329592", "sup_mail": "druma_cse@vignan.ac.in", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 31, "reg_no": "221PG04010", "name": "Swetha G", "area": "cloud", "year": 2023, "phone": "9705368600", "email": "swethareddy630@gmail.com", "sup": "Dr. Md. Oqail Ahmad", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "8439243408", "sup_mail": "drmoa@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "9247465125", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 32, "reg_no": "221PG04011", "name": "Mudu Chinababu", "area": "cloud", "year": 2023, "phone": "9963891727", "email": "mchinna64@gmail.com", "sup": "Dr. Md. Oqail Ahmad", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "8439243408", "sup_mail": "drmoa@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "9247465125", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 33, "reg_no": "221PG04012", "name": "Chavva Ravi Kishore Reddy", "area": "ML", "year": 2023, "phone": "8186906603", "email": "crkr_cse@vignan.ac.in", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9494451255", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 34, "reg_no": "221PG04016", "name": "Narendra Krishna Meka", "area": "ML", "year": 2023, "phone": "8886259999", "email": "narendra@sasi.ac.in", "sup": "Dr. N. Veeranjaneyulu", "desig": "Professor", "dept": "IT", "sup_phone": "9347162038", "sup_mail": "drnvn_it@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 35, "reg_no": "221PG04017", "name": "Kranthisudha Burugupalli", "area": "ML", "year": 2023, "phone": "8886259999", "email": "kranthi@sasi.ac.in", "sup": "Dr. K. Sujatha", "desig": "Associate Professor", "dept": "IT", "sup_phone": "9989728642", "sup_mail": "drks_it@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 36, "reg_no": "221PG04014", "name": "Chithirala Bala Subramanyam", "area": "DL", "year": 2023, "phone": "9848384740", "email": "balu.ch1203@gmail.com", "sup": "Dr. Hemanta Kumar Bhuyan", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8333093453", "sup_mail": "hmb.bhuyan@gmail.com", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9494451255", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 37, "reg_no": "221PG04015", "name": "Radhika Meegada", "area": "DL", "year": 2023, "phone": "9490612149", "email": "radhika.meegada@gmail.com", "sup": "Dr. Hemanta Kumar Bhuyan", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8333093453", "sup_mail": "hmb.bhuyan@gmail.com", "ext_name": "Dr USN Raju", "ext_affil": "NIT Warangal", "ext_phone": "9494451255", "ext_mail": "usnraju@nitw.ac.in", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 38, "reg_no": "231FG04002", "name": "B. Anil Babu", "area": "Networks", "year": 2023, "phone": "8688070939", "email": "anil92bathula@gmail.com", "sup": "Dr. P. Subba Rao", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8977178466", "sup_mail": "drpsr_it@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 39, "reg_no": "231PG04002", "name": "Kema Prathyusha", "area": "ML", "year": 2023, "phone": "8977625811", "email": "kemaprathyusha@gmail.com", "sup": "Dr. J Vinoj", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9751489857", "sup_mail": "drjv_cse@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 40, "reg_no": "231PG04003", "name": "Thota Sai Lalith Prasad", "area": "ML", "year": 2023, "phone": "8686167017", "email": "sailalith15@gmail.com", "sup": "Dr. K. B. Mani Kandan", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9488233376", "sup_mail": "drkbm_cse@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 41, "reg_no": "231PG04001", "name": "G Yashaswini", "area": "Image Processing ML", "year": 2023, "phone": "9642402369", "email": "yashaswinialjapur@gmail.com", "sup": "Dr. R. Renugadevi", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9342247173", "sup_mail": "renu.rajaram@gmail.com", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 42, "reg_no": "231FG04004", "name": "Sunkara Anitha", "area": "NLP", "year": 2023, "phone": "9505044559", "email": "anithasunkara9@gmail.com", "sup": "Dr. E. Deepak Chowdary", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9553147457", "sup_mail": "edc_cse@vignan.ac.in", "ext_name": "Dr. Nagesh Bhattu Sristy", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "8247001338", "ext_mail": "nageshbhattu@nitandhra.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 43, "reg_no": "231PG04005", "name": "Sirisha Balla", "area": "ML", "year": 2023, "phone": "9000700333", "email": "balla.sirisha5@gmail.com", "sup": "Dr. Satish Kumar Satti", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9581236143", "sup_mail": "sskumar_cse@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "9247465125", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 44, "reg_no": "231PG04006", "name": "Satyanarayana Botsa", "area": "Cryptography", "year": 2023, "phone": "9398291271", "email": "satyanarayana.botsa@gmail.com", "sup": "Dr. M. Nirupama Bhat", "desig": "Professor", "dept": "CSE", "sup_phone": "9908823834", "sup_mail": "drmnb_cse@vignan.ac.in", "ext_name": "Dr. R. Ranjan Routh", "ext_affil": "NIT Warangal", "ext_phone": "8332969418", "ext_mail": "rashrr@nitw.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 45, "reg_no": "231PG04007", "name": "Batta Saranya", "area": "DL", "year": 2023, "phone": "9491000398", "email": "Saranya.batta@gmail.com", "sup": "Dr. M. Sunil Babu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "8333001991", "sup_mail": "drmsb_cse@vignan.ac.in", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 46, "reg_no": "231PG04008", "name": "Bandela Narsingam", "area": "ML", "year": 2023, "phone": "9959191665", "email": "bnarsingam@gmail.com", "sup": "Dr. J Vinoj", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9751489857", "sup_mail": "drjv_cse@vignan.ac.in", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. M. Nirupama Bhat", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9908823834", "int1_mail": "drmnb_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 47, "reg_no": "231PG04009", "name": "B Rajani", "area": "Cyber Security", "year": 2023, "phone": "9959748362", "email": "rajani2u@gmail.com", "sup": "Dr. Ziaul Haque Choudhury", "desig": "Associate Professor", "dept": "IT", "sup_phone": "8072257855", "sup_mail": "zhc_it@vignan.ac.in", "ext_name": "Dr. R. Ranjan Routh", "ext_affil": "NIT Warangal", "ext_phone": "8332969418", "ext_mail": "rashrr@nitw.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 48, "reg_no": "231PG04010", "name": "Cherukuri Sukanya", "area": "ML", "year": 2023, "phone": "8309347821", "email": "sukanyabittu111@gmail.com", "sup": "Dr. B. Jyostna Devi", "desig": "Assistant Professor", "dept": "ACSE", "sup_phone": "7358209553", "sup_mail": "bjd_acse@vignan.ac.in", "ext_name": "Dr. C.R. Rao", "ext_affil": "University of Hyderabad", "ext_phone": "9247465125", "ext_mail": "crrcs@uohyd.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647679", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 49, "reg_no": "231PG04012", "name": "Mudumba Sreepavani", "area": "Cloud, NW", "year": 2023, "phone": "9949666201", "email": "pavanivs80@gmail.com", "sup": "Dr. D. Yakobu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9848123456", "sup_mail": "dy_cse@vignan.ac.in", "ext_name": "Dr. B. Ramesh Babu", "ext_affil": "MNIT Jaipur", "ext_phone": "9549654395", "ext_mail": "rbbattula.cse@mnit.ac.in", "int1_name": "Dr. K. V. Krishna Kishore", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9490647679", "int1_mail": "kishorekvk_1@yahoo.com", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 50, "reg_no": "231FG04005", "name": "Tipura Damarla", "area": "ML", "year": 2024, "phone": "8977267707", "email": "tipuradamarla@gmail.com", "sup": "Dr. S. V. Phani Kumar", "desig": "Professor", "dept": "CSE", "sup_phone": "9912514034", "sup_mail": "drsvpk_cse@vignan.ac.in", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 51, "reg_no": "231FG04006", "name": "Narayanam R S Lakshmi Prasanthi", "area": "ML", "year": 2024, "phone": "9849792864", "email": "narayanam.prasanthi@gmail.com", "sup": "Dr. S. Devakumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9959949221", "sup_mail": "sdk_cse@vignan.ac.in", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 52, "reg_no": "241FG04001", "name": "Sumalatha M", "area": "DL", "year": 2024, "phone": "9553958115", "email": "suma.magham@gmail.com", "sup": "Dr. R. Renugadevi", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9342247173", "sup_mail": "renu.rajaram@gmail.com", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 53, "reg_no": "241FG04002", "name": "Yalamanchili Bhanu Prasad", "area": "N/W Security", "year": 2024, "phone": "9912996788", "email": "ypbhanu@gmail.com", "sup": "Dr. Venkatesulu Dondeti", "desig": "Professor", "dept": "CSE", "sup_phone": "9840850744", "sup_mail": "drdv_cse@vignan.ac.in", "ext_name": "Dr. R. Ranjan Routh", "ext_affil": "NIT Warangal", "ext_phone": "8332969418", "ext_mail": "rashrr@nitw.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 54, "reg_no": "241FG04003", "name": "Mohan Venkateswara Rao Mathi", "area": "ML", "year": 2024, "phone": "9440129876", "email": "mohan.venkateswararao@gmail.com", "sup": "Dr. S. Devakumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9959949221", "sup_mail": "sdk_cse@vignan.ac.in", "ext_name": "Dr. RBV Subramanyam", "ext_affil": "NIT Warangal", "ext_phone": "9491346969", "ext_mail": "rbvs66@gmail.com", "int1_name": "Dr. N. Veeranjaneyulu", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9347162038", "int1_mail": "drnvn_it@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 55, "reg_no": "241PG04002", "name": "Yalla S J V Durga Bhavani Devika Rani", "area": "ML", "year": 2024, "phone": "9676994353", "email": "devikarani.vignan2@gmail.com", "sup": "Dr. Satish Kumar Satti", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9581236143", "sup_mail": "sskumar_cse@vignan.ac.in", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 56, "reg_no": "241PG04003", "name": "Lakshmi Lalith Sristi", "area": "ML", "year": 2024, "phone": "9959076969", "email": "lalithayagnam03@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 57, "reg_no": "241PG04004", "name": "Sravanthi Javvadi", "area": "ML", "year": 2024, "phone": "9676994353", "email": "sravanthi.javvadi@gmail.com", "sup": "Dr. B. Jyostna Devi", "desig": "Associate Professor", "dept": "ACSE", "sup_phone": "7358209553", "sup_mail": "bjd_acse@vignan.ac.in", "ext_name": "Dr. R. Ranjan Routh", "ext_affil": "NIT Warangal", "ext_phone": "8332969418", "ext_mail": "rashrr@nitw.ac.in", "int1_name": "Dr. Venkatesulu Dondeti", "int1_desig": "Professor", "int1_dept": "CSE", "int1_phone": "9840850744", "int1_mail": "drdv_cse@vignan.ac.in", "int2_name": "Dr. K. V. Krishna Kishore", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9490647678", "int2_mail": "kishorekvk_1@yahoo.com"},
    {"sno": 58, "reg_no": "241PG04005", "name": "Edikoju Shirisha", "area": "Image Processing", "year": 2024, "phone": "9052130151", "email": "edikoju.shirisha@gmail.com", "sup": "Dr. Prasanth Upadhyay", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9805406546", "sup_mail": "drpu_cse@vignan.ac.in", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 59, "reg_no": "241PG04007", "name": "Gattu Tejaswini", "area": "Image Processing", "year": 2024, "phone": "9291951333", "email": "tejaswini22karnati@gmail.com", "sup": "Dr. S. Devakumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9959949221", "sup_mail": "sdk_cse@vignan.ac.in", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 60, "reg_no": "241PG04008", "name": "Mulakalapalli Vijayakumar", "area": "RK", "year": 2024, "phone": "8722224153", "email": "vijaykumar.mulakalapalli@daimlertruck.com", "sup": "Dr. D. Yakobu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9848123456", "sup_mail": "dy_cse@vignan.ac.in", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. A. R. Vijayababu", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9848987654", "int1_mail": "arv_cse@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 61, "reg_no": "241FG04004", "name": "Swathi Koganti", "area": "cloud", "year": 2024, "phone": "9491664165", "email": "swathimca54@gmail.com", "sup": "Dr. D. Yakobu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9848123456", "sup_mail": "dy_cse@vignan.ac.in", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. Nelapati Ananda Rao", "int2_desig": "Assistant Professor", "int2_dept": "ECE", "int2_phone": "9491499407", "int2_mail": "nar_ece@vignan.ac.in"},
    {"sno": 62, "reg_no": "241PG04009", "name": "Chekka Sravani", "area": "ML", "year": 2024, "phone": "9676482231", "email": "sravani1191@gmail.com", "sup": "Dr. K. B. Mani Kandan", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9488233376", "sup_mail": "drkbm_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. Arnab De", "int1_desig": "Assistant Professor", "int1_dept": "ACSE", "int1_phone": "9614547390", "int1_mail": "drnb_acse@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 63, "reg_no": "241PG04010", "name": "Maheswarareddy Mugi", "area": "ML", "year": 2024, "phone": "9398385412", "email": "mugimahesh@gmail.com", "sup": "Dr. Prasanth Upadhyay", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9805406546", "sup_mail": "drpu_cse@vignan.ac.in", "ext_name": "Dr. Suganya Devi", "ext_affil": "NIT", "ext_phone": "9443123456", "ext_mail": "suganya@nit.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. Rakcinpha Hatiaruah", "int2_desig": "Asst. Professor", "int2_dept": "ECE", "int2_phone": "7891613746", "int2_mail": "drrh-ece@vignan.ac.in"},
    {"sno": 64, "reg_no": "241PG04011", "name": "Nazima Begum", "area": "ML", "year": 2024, "phone": "7815867060", "email": "nazimabegum86@gmail.com", "sup": "Dr. S. Devakumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9959949221", "sup_mail": "sdk_cse@vignan.ac.in", "ext_name": "Dr. Suganya Devi", "ext_affil": "NIT", "ext_phone": "9443123456", "ext_mail": "suganya@nit.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. P. J. Reginald", "int2_desig": "Associate Professor", "int2_dept": "ECE", "int2_phone": "9885342118", "int2_mail": "drpjr_ece@vignan.ac.in"},
    {"sno": 65, "reg_no": "241PG04012", "name": "Sangula Pardha Saradhi", "area": "ML", "year": 2024, "phone": "8019319325", "email": "pardhasaradhi.sangula@gmail.com", "sup": "Dr. E. Deepak Chowdary", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9553147457", "sup_mail": "edc_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. V. Aswini", "int2_desig": "Asst. Professor", "int2_dept": "ECE", "int2_phone": "8919244978", "int2_mail": "va_ece@vignan.ac.in"},
    {"sno": 66, "reg_no": "251FG04001", "name": "Kolla Jyotsna", "area": "ML", "year": 2025, "phone": "7337373032", "email": "jyotsnanaresh71@gmail.com", "sup": "Dr. S. V. Phani Kumar", "desig": "Professor", "dept": "CSE", "sup_phone": "9912514034", "sup_mail": "drsvpk_cse@vignan.ac.in", "ext_name": "Dr. Suganya Devi", "ext_affil": "NIT", "ext_phone": "9443123456", "ext_mail": "suganya@nit.ac.in", "int1_name": "Dr. Chinnam Siva Koteswara Rao", "int1_desig": "Professor", "int1_dept": "IT", "int1_phone": "9440129999", "int1_mail": "cskr_it@vignan.ac.in", "int2_name": "Dr. M. Nirupama Bhat", "int2_desig": "Professor", "int2_dept": "CSE", "int2_phone": "9908823834", "int2_mail": "drmnb_cse@vignan.ac.in"},
    {"sno": 67, "reg_no": "251FG04003", "name": "Tanigundala Leelavathy", "area": "DL", "year": 2025, "phone": "8919420637", "email": "leelavathy12345@gmail.com", "sup": "Dr. Satish Kumar Satti", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9581236143", "sup_mail": "sskumar_cse@vignan.ac.in", "ext_name": "Dr. Suganya Devi", "ext_affil": "NIT", "ext_phone": "9443123456", "ext_mail": "suganya@nit.ac.in", "int1_name": "Dr. Kalpana P", "int1_desig": "Assoc Prof", "int1_dept": "Mathematics", "int1_phone": "9493915503", "int1_mail": "drpk_sh@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 68, "reg_no": "251PG04001", "name": "Nagendla Lavanya", "area": "DL", "year": 2025, "phone": "8885311015", "email": "lavanya.n@ksrmce.ac.in", "sup": "Dr. P. Sivaprasad", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9000443503", "sup_mail": "druma_cse@vignan.ac.in", "ext_name": "Dr. Suganya Devi", "ext_affil": "NIT", "ext_phone": "9443123456", "ext_mail": "suganya@nit.ac.in", "int1_name": "Dr. G. Srinivasa Rao", "int1_desig": "Assoc Prof", "int1_dept": "Mathematics", "int1_phone": "9440556677", "int1_mail": "drgsr_sh@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 69, "reg_no": "251FG04004", "name": "Vogirala Nandini", "area": "ML", "year": 2025, "phone": "9398983743", "email": "nandu.vogirala@gmail.com", "sup": "Dr. M. Sunil Babu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "8333001991", "sup_mail": "drmsb_cse@vignan.ac.in", "ext_name": "Dr. Suganya Devi", "ext_affil": "NIT", "ext_phone": "9443123456", "ext_mail": "suganya@nit.ac.in", "int1_name": "Dr. M. Umadevi", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9603329592", "int1_mail": "druma_cse@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 70, "reg_no": "251FG04005", "name": "Nakkala Mounika", "area": "DL", "year": 2025, "phone": "9603741419", "email": "nakkalamounika2121@gmail.com", "sup": "Dr. J Vinoj", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9751489857", "sup_mail": "drjv_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. P. Vijay Raghavan", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9629850400", "int1_mail": "drvvr_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 71, "reg_no": "251PG04003", "name": "Muppalaneni Subhashini", "area": "ML", "year": 2025, "phone": "8886046789", "email": "subhashinimuppalanenim@gmail.com", "sup": "Dr. M. Umadevi", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9603329592", "sup_mail": "druma_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. V. Aswini", "int1_desig": "Assistant Professor", "int1_dept": "ECE", "int1_phone": "8919244978", "int1_mail": "va_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 72, "reg_no": "251PG04004", "name": "Abhiram M", "area": "ML", "year": 2025, "phone": "9886763726", "email": "ramabhisharma2@gmail.com", "sup": "Dr. S. Devakumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9959949221", "sup_mail": "sdk_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. P. J. Reginald", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9885342118", "int1_mail": "drpjr_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 73, "reg_no": "251FG04006", "name": "Sai Eswari Yalavarthi", "area": "ML", "year": 2025, "phone": "8074131669", "email": "saieswariyalavarthi@gmail.com", "sup": "Dr. K. V. Krishna Kishore", "desig": "Professor", "dept": "CSE", "sup_phone": "9490647678", "sup_mail": "kishorekvk_1@yahoo.com", "ext_name": "Dr. Naresh Babu Muppalaneni", "ext_affil": "NIT", "ext_phone": "8897165555", "ext_mail": "nareshmuppalaneni@gmail.com", "int1_name": "Dr. S. V. Phani Kumar", "int1_desig": "Associate Professor", "int1_dept": "CSE", "int1_phone": "9912514034", "int1_mail": "drsvpk_cse@vignan.ac.in", "int2_name": "Dr. M. Umadevi", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9603329592", "int2_mail": "druma_cse@vignan.ac.in"},
    {"sno": 74, "reg_no": "251FG04007", "name": "Thirunagari Sowjanya", "area": "ML", "year": 2025, "phone": "9290138176", "email": "st_it@vignan.ac.in", "sup": "Dr. S. Devakumar", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9959949221", "sup_mail": "sdk_cse@vignan.ac.in", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. Nelapati Ananda Rao", "int1_desig": "Assistant Professor", "int1_dept": "ECE", "int1_phone": "9491499407", "int1_mail": "nar_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 75, "reg_no": "251FG04008", "name": "N Archana", "area": "ML", "year": 2025, "phone": "8985716984", "email": "archananalluri202@gmail.com", "sup": "Dr. M. Sunil Babu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "8333001991", "sup_mail": "drmsb_cse@vignan.ac.in", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. M. Laavanya", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9976224977", "int1_mail": "drml_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 76, "reg_no": "251FG04009", "name": "K Hareesh", "area": "ML", "year": 2025, "phone": "9948723118", "email": "hari2245srk@gmail.com", "sup": "Dr. M. Sunil Babu", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "8333001991", "sup_mail": "drmsb_cse@vignan.ac.in", "ext_name": "Dr. Salman Abdul Moiz", "ext_affil": "University of Hyderabad", "ext_phone": "9885049992", "ext_mail": "salman@uohyd.ac.in", "int1_name": "Dr. V. Vijayaraghavan", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9942323293", "int1_mail": "drvvr_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 77, "reg_no": "251PG04201", "name": "Ch. Sugunalatha", "area": "ML", "year": 2025, "phone": "9848112233", "email": "suguna.c@nriit.edu.in", "sup": "Dr. P. Jhansi Lakshmi", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9848334455", "sup_mail": "dpjl_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. Mercy Rosalina", "int1_desig": "Professor", "int1_dept": "EEE", "int1_phone": "9440889900", "int1_mail": "mr_eee@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 78, "reg_no": "251PG04202", "name": "Chigiri Susmitha", "area": "ML", "year": 2025, "phone": "9848223344", "email": "chigirisushmitha@gmail.com", "sup": "Dr. M. Umadevi", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9603329592", "sup_mail": "druma_cse@vignan.ac.in", "ext_name": "Dr. Dalton Meitei Thounaojam", "ext_affil": "NIT", "ext_phone": "9436123456", "ext_mail": "dalton@nit.ac.in", "int1_name": "Dr. Annapurna K", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9966426477", "int1_mail": "drka_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 79, "reg_no": "251PG04203", "name": "Kota Divya Bharathi", "area": "NW", "year": 2025, "phone": "9177390474", "email": "kotadivya6@gmail.com", "sup": "Dr. James Deva Koresh H", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9840112233", "sup_mail": "jdkh_cse@vignan.ac.in", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. Annapurna Kunchaparti", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9966426477", "int1_mail": "drka_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 80, "reg_no": "251PG04204", "name": "Vangapandu Venkata Kalyani", "area": "NW", "year": 2025, "phone": "8897134165", "email": "kalyani1.mith@gmail.com", "sup": "Dr. James Meyyapan", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9840223344", "sup_mail": "jm_cse@vignan.ac.in", "ext_name": "Dr. K Hima Bindu", "ext_affil": "NIT Andhra Pradesh", "ext_phone": "9494451255", "ext_mail": "himabinduk@nitandhra.ac.in", "int1_name": "Dr. V. Vijayaraghavan", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9942323293", "int1_mail": "drvvr_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 81, "reg_no": "251FG04201", "name": "Jidugu Charishma", "area": "ML", "year": 2025, "phone": "7013966530", "email": "jidugucharishma@gmail.com", "sup": "Dr. P. Jhansi Lakshmi", "desig": "Associate Professor", "dept": "CSE", "sup_phone": "9848334455", "sup_mail": "dpjl_cse@vignan.ac.in", "ext_name": "Dr. K. Satya Babu", "ext_affil": "IIIT", "ext_phone": "9440112233", "ext_mail": "ksb@iiit.ac.in", "int1_name": "Dr. Mercy Rosalina", "int1_desig": "Professor", "int1_dept": "EEE", "int1_phone": "9440889900", "int1_mail": "mr_eee@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 82, "reg_no": "251PG04205", "name": "Indraja P", "area": "ML", "year": 2025, "phone": "6302815644", "email": "indrajapasupuleti@gmail.com", "sup": "Dr. Vijitha Ananthy", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9848445566", "sup_mail": "va_cse@vignan.ac.in", "ext_name": "Dr. K. Satya Babu", "ext_affil": "IIIT", "ext_phone": "9440112233", "ext_mail": "ksb@iiit.ac.in", "int1_name": "Dr. P. Joshua Reginald", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9885342118", "int1_mail": "drpjr_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 83, "reg_no": "251PG04206", "name": "Srilakshmi Ramya Sakamudi", "area": "ML", "year": 2025, "phone": "9441598376", "email": "ramya.sakamudi@gmail.com", "sup": "Dr. Vijitha Ananthy", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9848445566", "sup_mail": "va_cse@vignan.ac.in", "ext_name": "Dr. K. Satya Babu", "ext_affil": "IIIT", "ext_phone": "9440112233", "ext_mail": "ksb@iiit.ac.in", "int1_name": "Dr. P. Joshua Reginald", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9885342118", "int1_mail": "drpjr_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"},
    {"sno": 84, "reg_no": "261FG04001", "name": "P Ramakrishna", "area": "ML", "year": 2026, "phone": "9652774368", "email": "ram.pavuluri@gmail.com", "sup": "Dr. R. Renugadevi", "desig": "Assistant Professor", "dept": "CSE", "sup_phone": "9342247173", "sup_mail": "renu.rajaram@gmail.com", "ext_name": "Dr. K. Satya Babu", "ext_affil": "IIIT", "ext_phone": "9440112233", "ext_mail": "ksb@iiit.ac.in", "int1_name": "Dr. M. Laavanya", "int1_desig": "Associate Professor", "int1_dept": "ECE", "int1_phone": "9976224977", "int1_mail": "drml_ece@vignan.ac.in", "int2_name": "Dr. S. V. Phani Kumar", "int2_desig": "Associate Professor", "int2_dept": "CSE", "int2_phone": "9912514034", "int2_mail": "drsvpk_cse@vignan.ac.in"}
]

def normalize_supervisor_name(name: str) -> str:
    n = name.strip().replace("  ", " ")
    if "Phani" in n:
        return "Dr. S. V. Phani Kumar"
    if "Krishna Kishore" in n:
        return "Dr. K. V. Krishna Kishore"
    if "Radha Rani" in n:
        return "Dr. D. Radha Rani"
    if "Nirupama" in n:
        return "Dr. M. Nirupama Bhat"
    if "Sunil" in n:
        return "Dr. M. Sunil Babu"
    if "Subba" in n:
        return "Dr. P. Subba Rao"
    if "Bala Krishna" in n or "Balakrishna" in n:
        return "Dr. S. Bala Krishna"
    if "Veeranjaneyulu" in n:
        return "Dr. N. Veeranjaneyulu"
    if "Renuga" in n:
        return "Dr. R. Renugadevi"
    if "Devakumar" in n or "Deva Kumar" in n:
        return "Dr. S. Devakumar"
    if "Satti" in n or "Satish" in n:
        return "Dr. Satish Kumar Satti"
    return n

def normalize_designation(desig: str) -> tuple[str, int]:
    d = desig.lower()
    if "asst" in d or "assistant" in d:
        return "Assistant Professor", 4
    elif "asso" in d or "assoc" in d:
        return "Associate Professor", 6
    else:
        return "Professor", 8

def seed_database(drop_existing: bool = False):
    if drop_existing:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    if not drop_existing and db.query(PhDScholar).count() > 0:
        print("[SEED] Database already contains records. Skipping initial seeding.")
        db.close()
        return

    print("[SEED] Starting database initialization with real Vignan University dataset...")

    # 1. Seed Departments
    dept_data = [
        ("CSE", "Computer Science and Engineering", "School of Computing & Informatics"),
        ("IT", "Information Technology", "School of Computing & Informatics"),
        ("ACSE", "Advanced Computer Science and Engineering", "School of Computing & Informatics"),
        ("ECE", "Electronics and Communication Engineering", "School of Electrical Sciences"),
        ("Mech", "Mechanical Engineering", "School of Mechanical & Construction Sciences"),
        ("BT", "Biotechnology", "School of Applied Sciences & Biotechnology"),
        ("S & H", "Sciences and Humanities", "School of Basic Sciences"),
        ("Mathematics", "Department of Mathematics", "School of Basic Sciences")
    ]
    dept_map = {}
    for code, name, school in dept_data:
        d = Department(code=code, name=name, school_name=school)
        db.add(d)
        db.flush()
        dept_map[code] = d

    # 2. Collect & Seed Faculty Supervisors
    faculty_map = {}
    unique_supervisors = {}
    for item in RAW_SCHOLARS:
        sname = normalize_supervisor_name(item["sup"])
        if sname not in unique_supervisors:
            unique_supervisors[sname] = {
                "name": sname,
                "desig": item["desig"],
                "dept": item["dept"].replace(".", "").strip(),
                "phone": item.get("sup_phone"),
                "email": item.get("sup_mail")
            }

    # Ensure prominent deans & HoDs exist with roles
    admin_roles = {
        "Dr. S. V. Phani Kumar": "Dean of Research",
        "Dr. K. V. Krishna Kishore": "HoD",
        "Dr. M. Nirupama Bhat": "Doctoral Committee Chair",
        "Dr. N. Veeranjaneyulu": "Associate Dean",
        "Dr. P. Nagabhushan": "Vice Chancellor / Distinguished Professor"
    }

    fac_idx = 100
    used_emails = set()
    for name, f_info in unique_supervisors.items():
        dept_code = f_info["dept"]
        dept = dept_map.get(dept_code) or dept_map["CSE"]
        
        # Clean designation
        desig, cap = normalize_designation(f_info["desig"])

        emp_code = f"VFSTR-FAC-{fac_idx}"
        fac_idx += 1
        
        # Ensure unique email
        cand_email = f_info.get("email")
        if not cand_email or cand_email in used_emails or "druma_cse" in cand_email and "Umadevi" not in name:
            clean_name = name.lower().replace("dr.", "").replace("dr ", "").strip().replace(" ", "_").replace(".", "")
            cand_email = f"{clean_name}@{dept_code.lower()}.vignan.ac.in"
        used_emails.add(cand_email)
        role = admin_roles.get(name, "None")

        f = Faculty(
            emp_code=emp_code,
            name=name,
            email=cand_email,
            phone=f_info["phone"] or "9912514034",
            department_id=dept.id,
            designation=desig,
            joining_date=date(2014, 6, 1),
            experience_years=14.5 if desig == "Professor" else 8.5,
            teaching_hours_per_week=8.0 if role != "None" else 14.0,
            administrative_role=role,
            max_supervision_capacity=cap,
            current_supervision_count=0
        )
        db.add(f)
        db.flush()
        faculty_map[name] = f

        # Seed Author Identifier
        author_id = AuthorIdentifier(
            faculty_id=f.id,
            scopus_author_id=f"57{fac_idx}92014",
            orcid_id=f"0000-0002-{fac_idx}-8819",
            wos_researcher_id=f"AAH-{fac_idx}-2020",
            google_scholar_id=f"scholar_{fac_idx}"
        )
        db.add(author_id)

    # 3. Seed Affiliation Variants for Agent 17
    variants = [
        ("Vignan's Foundation for Science, Technology and Research", "VFSTR"),
        ("Vignan's Foundation for Science, Technology and Research", "Vignan University"),
        ("Vignan's Foundation for Science, Technology and Research", "VFSTR Deemed to be University, Vadlamudi"),
        ("Vignan's Foundation for Science, Technology and Research", "Vignan's Foundation for Science Technology & Research (Deemed to be University), Guntur"),
        ("Vignan's Foundation for Science, Technology and Research", "Department of Computer Science and Engineering, VFSTR"),
        ("Vignan's Foundation for Science, Technology and Research", "School of Computing and Informatics, Vignan University")
    ]
    for can, var in variants:
        db.add(AffiliationVariant(canonical_name=can, variant_string=var))

    # 4. Seed Journals for Agent 18 & 17
    journals_data = [
        {"title": "IEEE Transactions on Cybernetics", "issn": "2168-2267", "eissn": "2168-2275", "pub": "IEEE", "q": "Q1", "if": 11.8, "citescore": 19.5, "sjr": 2.8, "rate": 12.0, "weeks": 10, "risk": 2, "delisted": False},
        {"title": "Pattern Recognition", "issn": "0031-3203", "eissn": "1873-5142", "pub": "Elsevier", "q": "Q1", "if": 8.0, "citescore": 16.2, "sjr": 2.1, "rate": 15.0, "weeks": 8, "risk": 4, "delisted": False},
        {"title": "Neural Computing and Applications", "issn": "0941-0643", "eissn": "1433-3058", "pub": "Springer", "q": "Q1", "if": 6.0, "citescore": 10.4, "sjr": 1.4, "rate": 20.0, "weeks": 9, "risk": 5, "delisted": False},
        {"title": "Expert Systems with Applications", "issn": "0957-4174", "eissn": "1873-6793", "pub": "Elsevier", "q": "Q1", "if": 8.5, "citescore": 14.8, "sjr": 2.0, "rate": 14.0, "weeks": 11, "risk": 3, "delisted": False},
        {"title": "Computers & Security", "issn": "0167-4048", "eissn": "1872-6208", "pub": "Elsevier", "q": "Q1", "if": 5.6, "citescore": 11.2, "sjr": 1.3, "rate": 18.0, "weeks": 7, "risk": 3, "delisted": False},
        {"title": "Multimedia Tools and Applications", "issn": "1380-7501", "eissn": "1573-7721", "pub": "Springer", "q": "Q2", "if": 3.6, "citescore": 7.5, "sjr": 0.9, "rate": 26.0, "weeks": 12, "risk": 8, "delisted": False},
        {"title": "International Journal of Information Security", "issn": "1615-5262", "eissn": "1615-5270", "pub": "Springer", "q": "Q2", "if": 3.2, "citescore": 6.8, "sjr": 0.8, "rate": 24.0, "weeks": 8, "risk": 6, "delisted": False},
        {"title": "Journal of Ambient Intelligence and Humanized Computing", "issn": "1868-5137", "eissn": "1868-5145", "pub": "Springer (Delisted)", "q": "Unranked", "if": 0.0, "citescore": 0.0, "sjr": 0.1, "rate": 45.0, "weeks": 2, "risk": 85, "delisted": True, "del_reason": "Breach of peer review integrity and editorial standards."},
        {"title": "International Journal of Advanced Trends in Computer Science", "issn": "2278-3091", "eissn": "2278-3091", "pub": "Academy Publishers", "q": "Unranked", "if": 0.0, "citescore": 0.0, "sjr": 0.05, "rate": 90.0, "weeks": 1, "risk": 95, "delisted": True, "del_reason": "Flagged predatory publisher with pay-to-publish practices."}
    ]
    journal_map = {}
    for jdata in journals_data:
        j = Journal(
            title=jdata["title"],
            canonical_issn=jdata["issn"],
            e_issn=jdata.get("eissn"),
            publisher=jdata["pub"],
            wos_indexed=not jdata["delisted"],
            scopus_indexed=not jdata["delisted"],
            ugc_care_indexed=not jdata["delisted"],
            jcr_quartile=jdata["q"],
            citescore_quartile=jdata["q"],
            impact_factor=jdata["if"],
            citescore=jdata["citescore"],
            sjr=jdata["sjr"],
            acceptance_rate=jdata["rate"],
            peer_review_weeks=jdata["weeks"],
            predatory_risk_score=jdata["risk"],
            is_delisted=jdata["delisted"],
            delisted_reason=jdata.get("del_reason"),
            subject_category="Computer Science & AI",
            alternative_journal_ids=[1, 2, 3]
        )
        db.add(j)
        db.flush()
        journal_map[j.canonical_issn] = j

    # 5. Ingest 84 Real Scholars (Agent 25)
    print(f"[SEED] Ingesting {len(RAW_SCHOLARS)} doctoral scholars into database...")
    today = date.today()

    for item in RAW_SCHOLARS:
        reg_no = item["reg_no"]
        is_full_time = "FG" in reg_no
        mode = "Full-Time" if is_full_time else "Part-Time"
        min_years = 3.0 if is_full_time else 4.0
        max_years = 5.0 if is_full_time else 7.0
        
        adm_year = item["year"]
        reg_date = date(adm_year, 7, 15)
        min_date = date(int(adm_year + min_years), 7, 15)
        max_date = date(int(adm_year + max_years), 7, 15)

        # Status determination based on cohort year
        if adm_year <= 2017:
            status = "Thesis_Submitted" if (today < max_date) else "Stalled"
        elif adm_year in [2018, 2019]:
            status = "Pre_Submission"
        elif adm_year in [2020, 2021, 2022]:
            status = "DC_Review"
        elif adm_year in [2023, 2024]:
            status = "Comprehensive_Exam"
        else: # 2025, 2026
            status = "Coursework"

        # Stalled logic
        is_stalled = (today > max_date) or (adm_year == 2014)
        stalled_reason = "Exceeded maximum permissible duration under regulations" if is_stalled else None

        sup_name = normalize_supervisor_name(item["sup"])
        supervisor = faculty_map.get(sup_name)

        dept_code = item["dept"].replace(".", "").strip()
        dept = dept_map.get(dept_code) or dept_map["CSE"]

        scholar = PhDScholar(
            reg_no=reg_no,
            name=item["name"],
            email=item["email"],
            phone=item.get("phone"),
            admission_year=adm_year,
            mode=mode,
            registration_date=reg_date,
            department_id=dept.id,
            supervisor_id=supervisor.id if supervisor else None,
            research_area=item["area"],
            current_status=status,
            min_duration_years=min_years,
            max_duration_years=max_years,
            min_duration_date=min_date,
            max_duration_date=max_date,
            is_stalled=is_stalled,
            stalled_reason=stalled_reason,
            publication_requirement_met=(adm_year <= 2020)
        )
        db.add(scholar)
        db.flush()

        # Update supervisor current count
        if supervisor:
            supervisor.current_supervision_count += 1

        # Seed Doctoral Committee
        dc = DoctoralCommittee(
            scholar_id=scholar.id,
            chairman_name="Dr. M. Nirupama Bhat",
            chairman_dept="CSE",
            chairman_phone="9908823834",
            chairman_email="drmnb_cse@vignan.ac.in",
            hod_nominee_name="Dr. K. V. Krishna Kishore",
            hod_nominee_dept="CSE",
            hod_nominee_phone="9490647678",
            hod_nominee_email="kishorekvk_1@yahoo.com",
            external_expert_name=item.get("ext_name"),
            external_expert_affiliation=item.get("ext_affil") or "National Institute of Technology",
            external_expert_phone=item.get("ext_phone"),
            external_expert_email=item.get("ext_mail"),
            internal_expert1_name=item.get("int1_name"),
            internal_expert1_designation=item.get("int1_desig"),
            internal_expert1_dept=item.get("int1_dept"),
            internal_expert1_phone=item.get("int1_phone"),
            internal_expert1_email=item.get("int1_mail"),
            internal_expert2_name=item.get("int2_name"),
            internal_expert2_designation=item.get("int2_desig"),
            internal_expert2_dept=item.get("int2_dept"),
            internal_expert2_phone=item.get("int2_phone"),
            internal_expert2_email=item.get("int2_mail"),
            interschool_nominee_name="Dr. Ravi Sekhar",
            interschool_nominee_dept="ECE",
            interschool_nominee_phone="9243440775",
            interschool_nominee_email="yrs_ece@vignan.ac.in",
            constituted_date=reg_date + timedelta(days=60)
        )
        db.add(dc)

        # Specifically stalled cases (e.g. 2014 cohort or scholars with stalled DC progress)
        is_specifically_stalled = (adm_year == 2014) or (reg_no in ["171FG04005", "191PG04205", "221PG04008"])
        
        # Seed Milestones with realistic cohort progression
        milestones = [
            ("CW", "Coursework Completion", 1, 12, (adm_year <= 2024 and not is_specifically_stalled) or (adm_year <= 2020)),
            ("CE", "Comprehensive Examination", 2, 18, (adm_year <= 2024 and not is_specifically_stalled) or (adm_year <= 2020)),
            ("RPD", "Research Proposal Defence", 3, 24, (adm_year <= 2023 and not is_specifically_stalled) or (adm_year <= 2020)),
            ("DC1", "1st Doctoral Committee Review", 4, 6, (adm_year <= 2025 and not is_specifically_stalled) or (adm_year <= 2020)),
            ("DC2", "2nd Doctoral Committee Review", 5, 12, (adm_year <= 2024 and not is_specifically_stalled) or (adm_year <= 2020)),
            ("DC3", "3rd Doctoral Committee Review", 6, 18, (adm_year <= 2024 and not is_specifically_stalled) or (adm_year <= 2020)),
            ("PUB_REQ", "Publication Requirement Fulfilment", 7, 36, (adm_year <= 2021 and not is_specifically_stalled)),
            ("PRE_SUB", "Pre-Submission Seminar", 8, 42, (adm_year <= 2020 and not is_specifically_stalled)),
            ("SYN", "Synopsis Submission", 9, 44, (adm_year <= 2019 and not is_specifically_stalled)),
            ("THESIS", "Thesis Submission & Final Defence", 10, 48, (adm_year <= 2018 and not is_specifically_stalled))
        ]
        for mcode, mname, order, off_m, is_done in milestones:
            m_due = reg_date + timedelta(days=int(off_m * 30.4))
            m_status = "Completed" if is_done else ("Overdue" if (today > m_due and is_specifically_stalled) else "Upcoming")
            m = PhDMilestone(
                scholar_id=scholar.id,
                milestone_code=mcode,
                name=mname,
                sequence_order=order,
                due_date=m_due,
                completion_date=m_due - timedelta(days=10) if is_done else None,
                status=m_status,
                notes="Verified by Doctoral Committee" if is_done else None
            )
            db.add(m)

        # Seed Verified Publications & Research Outputs under the 9-Category Scoring Matrix
        if supervisor:
            if reg_no == "141PG04204":  # Scholar 1: Eligible with 13.0 pts (2x Cat 1 + 1x Cat 6)
                db.add(Publication(
                    doi=f"10.1109/TCYB.{adm_year}.{scholar.id}01",
                    title=f"Advanced Machine Learning Architectures for Predictive Analytics: An Empirical Investigation",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=1,
                    journal_name="IEEE Transactions on Cybernetics",
                    issn="2168-2267",
                    publication_year=adm_year + 2,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q1",
                    scopus_indexed=True,
                    wos_indexed=True,
                    citations_count=18,
                    category_code="CAT1",
                    category_name="SCI / SCI-E Indexed / ABDC Journals",
                    research_points=5.0,
                    is_tier1_mandatory=True,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1016/j.patcog.{adm_year}.{scholar.id}02",
                    title=f"Robust Feature Extraction Framework using Deep Learning in Computer Vision",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=2,
                    journal_name="Pattern Recognition",
                    issn="0031-3203",
                    publication_year=adm_year + 3,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q1",
                    scopus_indexed=True,
                    wos_indexed=True,
                    citations_count=12,
                    category_code="CAT1",
                    category_name="SCI / SCI-E Indexed / ABDC Journals",
                    research_points=5.0,
                    is_tier1_mandatory=True,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1109/ICBD.{adm_year}.{scholar.id}03",
                    title=f"Scalable Distributed Edge Intelligence for Real-Time Streaming Systems",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_name="IEEE Int. Conf. on Big Data Proceedings",
                    publication_year=adm_year + 4,
                    publication_type="Conference",
                    is_scholar_first_or_corresponding=True,
                    scopus_indexed=True,
                    wos_indexed=False,
                    category_code="CAT6",
                    category_name="Refereed Int. Conference with Full Proceedings (High-Class Publisher)",
                    research_points=3.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
            elif reg_no == "171FG04005":  # Scholar 2: MISSING TIER-1! Has 13.5 pts across Cat 4, 5b, 8, but 0 in Cat 1/2!
                db.add(Publication(
                    doi=f"10.1007/ijis.{adm_year}.{scholar.id}01",
                    title=f"Machine Learning Paradigms for Network Anomaly Detection in Enterprise Clouds",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=6,
                    journal_name="International Journal of Information Security",
                    issn="1615-5262",
                    publication_year=adm_year + 2,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q2",
                    scopus_indexed=True,
                    wos_indexed=False,
                    citations_count=8,
                    category_code="CAT4",
                    category_name="SCOPUS / E-SCI Indexed Journal",
                    research_points=4.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1007/mta.{adm_year}.{scholar.id}02",
                    title=f"Adaptive Feature Clustering Heuristics in High-Dimensional Data Spaces",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=5,
                    journal_name="Multimedia Tools and Applications",
                    issn="1380-7501",
                    publication_year=adm_year + 3,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q2",
                    scopus_indexed=True,
                    wos_indexed=False,
                    citations_count=6,
                    category_code="CAT4",
                    category_name="SCOPUS / E-SCI Indexed Journal",
                    research_points=4.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"IN-PATENT-GRANT-{scholar.id}03",
                    title=f"System and Method for Automated Signal Spectrum Anomaly Classification",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    publication_year=adm_year + 4,
                    publication_type="Patent",
                    is_scholar_first_or_corresponding=True,
                    category_code="CAT5_GRANT",
                    category_name="Patents Granted (DC Approved)",
                    research_points=3.5,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1145/icss.{adm_year}.{scholar.id}04",
                    title=f"Performance Evaluation of Heterogeneous Ensemble Classifiers on Unbalanced Datasets",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_name="Refereed Int. Conf. on Signals & Systems (DC Approved)",
                    publication_year=adm_year + 5,
                    publication_type="Conference",
                    is_scholar_first_or_corresponding=True,
                    category_code="CAT8",
                    category_name="Refereed International Conferences (DC Approved)",
                    research_points=2.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
            elif reg_no == "181PG04201":  # Scholar 3: Has Tier-1 (Cat 2: 4.5 pts) + Cat 4 (4.0 pts) = 8.5 pts (< 12 pts)
                db.add(Publication(
                    doi=f"10.1145/acm-topnotch.{adm_year}.{scholar.id}01",
                    title=f"Attention-Based Neural Representations for Multilingual Translation",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_name="ACM International Conference on Neural Architectures (SRB Approved Level 1)",
                    publication_year=adm_year + 2,
                    publication_type="Conference",
                    is_scholar_first_or_corresponding=True,
                    scopus_indexed=True,
                    category_code="CAT2",
                    category_name="Top-Notch Conferences (First Level, SRB Approved)",
                    research_points=4.5,
                    is_tier1_mandatory=True,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1016/eswa.{adm_year}.{scholar.id}02",
                    title=f"Cross-Lingual Information Retrieval: Benchmarks and Experimental Evaluation",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=3,
                    journal_name="Expert Systems with Applications",
                    issn="0957-4174",
                    publication_year=adm_year + 3,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q1",
                    scopus_indexed=True,
                    category_code="CAT4",
                    category_name="SCOPUS / E-SCI Indexed Journal",
                    research_points=4.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
            elif reg_no == "181PG04202":  # Scholar 4: Eligible with 13.5 pts (Cat 1: 5.0 + Cat 2: 4.5 + Cat 4: 4.0)
                db.add(Publication(
                    doi=f"10.1109/TCYB.{adm_year}.{scholar.id}01",
                    title=f"Deep Learning Optimizations for Medical Image Segmentation",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=1,
                    journal_name="IEEE Transactions on Cybernetics",
                    issn="2168-2267",
                    publication_year=adm_year + 2,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q1",
                    scopus_indexed=True,
                    wos_indexed=True,
                    category_code="CAT1",
                    category_name="SCI / SCI-E Indexed / ABDC Journals",
                    research_points=5.0,
                    is_tier1_mandatory=True,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1109/CVPR-SRB.{adm_year}.{scholar.id}02",
                    title=f"Graph Neural Networks for Topological Feature Modeling and Alignment",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_name="IEEE International Conference on Visual Pattern Recognition (SRB Approved Level 1)",
                    publication_year=adm_year + 3,
                    publication_type="Conference",
                    is_scholar_first_or_corresponding=True,
                    scopus_indexed=True,
                    category_code="CAT2",
                    category_name="Top-Notch Conferences (First Level, SRB Approved)",
                    research_points=4.5,
                    is_tier1_mandatory=True,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1007/mta.{adm_year}.{scholar.id}03",
                    title=f"Performance Evaluation of Convolutional Kernels across Distributed Architectures",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=5,
                    journal_name="Multimedia Tools and Applications",
                    issn="1380-7501",
                    publication_year=adm_year + 4,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    category_code="CAT4",
                    category_name="SCOPUS / E-SCI Indexed Journal",
                    research_points=4.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
            elif reg_no == "191PG04001":  # Scholar 5: Tier-1 met (Cat 1: 5.0) + Cat 4 (4.0) = 9.0 pts (< 12 pts)
                db.add(Publication(
                    doi=f"10.1109/TCYB.{adm_year}.{scholar.id}01",
                    title=f"Scalable Predictive Modeling using Graph Convolutional Networks",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=1,
                    journal_name="IEEE Transactions on Cybernetics",
                    issn="2168-2267",
                    publication_year=adm_year + 2,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    quartile="Q1",
                    scopus_indexed=True,
                    wos_indexed=True,
                    category_code="CAT1",
                    category_name="SCI / SCI-E Indexed / ABDC Journals",
                    research_points=5.0,
                    is_tier1_mandatory=True,
                    is_verified=True,
                    verification_status="Verified"
                ))
                db.add(Publication(
                    doi=f"10.1016/eswa.{adm_year}.{scholar.id}02",
                    title=f"Data Stream Classification using Online Bagging Ensembles",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_id=3,
                    journal_name="Expert Systems with Applications",
                    issn="0957-4174",
                    publication_year=adm_year + 3,
                    publication_type="Journal",
                    is_scholar_first_or_corresponding=True,
                    category_code="CAT4",
                    category_name="SCOPUS / E-SCI Indexed Journal",
                    research_points=4.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))
            elif adm_year <= 2021:  # General cohorts <= 2021
                if scholar.id % 3 == 0:
                    # Eligible: CAT1 (5.0) + CAT4 (4.0) + CAT6 (3.0) = 12.0 pts
                    db.add(Publication(
                        doi=f"10.1109/TCYB.{adm_year}.{scholar.id}01",
                        title=f"Novel Computational Framework for {scholar.research_area}: Principles and Empirical Assessment",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_id=1,
                        journal_name="IEEE Transactions on Cybernetics",
                        issn="2168-2267",
                        publication_year=adm_year + 2,
                        publication_type="Journal",
                        is_scholar_first_or_corresponding=True,
                        quartile="Q1",
                        scopus_indexed=True,
                        wos_indexed=True,
                        category_code="CAT1",
                        category_name="SCI / SCI-E Indexed / ABDC Journals",
                        research_points=5.0,
                        is_tier1_mandatory=True,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                    db.add(Publication(
                        doi=f"10.1007/mta.{adm_year}.{scholar.id}02",
                        title=f"Applied Heuristics in {scholar.research_area} Computing",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_id=5,
                        journal_name="Multimedia Tools and Applications",
                        issn="1380-7501",
                        publication_year=adm_year + 3,
                        publication_type="Journal",
                        is_scholar_first_or_corresponding=True,
                        category_code="CAT4",
                        category_name="SCOPUS / E-SCI Indexed Journal",
                        research_points=4.0,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                    db.add(Publication(
                        doi=f"10.1109/CONF.{adm_year}.{scholar.id}03",
                        title=f"Proceedings of International Conference on {scholar.research_area}",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_name="IEEE Conference Proceedings Series",
                        publication_year=adm_year + 3,
                        publication_type="Conference",
                        is_scholar_first_or_corresponding=True,
                        category_code="CAT6",
                        category_name="Refereed Int. Conference with Full Proceedings (High-Class Publisher)",
                        research_points=3.0,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                elif scholar.id % 3 == 1:
                    # Insufficient Points: CAT1 (5.0) + CAT5_PUB (2.0) = 7.0 pts (< 12 pts)
                    db.add(Publication(
                        doi=f"10.1016/j.patcog.{adm_year}.{scholar.id}01",
                        title=f"Fundamental Pattern Analysis in {scholar.research_area}",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_id=2,
                        journal_name="Pattern Recognition",
                        issn="0031-3203",
                        publication_year=adm_year + 2,
                        publication_type="Journal",
                        is_scholar_first_or_corresponding=True,
                        quartile="Q1",
                        scopus_indexed=True,
                        wos_indexed=True,
                        category_code="CAT1",
                        category_name="SCI / SCI-E Indexed / ABDC Journals",
                        research_points=5.0,
                        is_tier1_mandatory=True,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                    db.add(Publication(
                        doi=f"IN-PATENT-PUB-{scholar.id}02",
                        title=f"Apparatus for Real-Time {scholar.research_area} Optimization",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        publication_year=adm_year + 3,
                        publication_type="Patent",
                        is_scholar_first_or_corresponding=True,
                        category_code="CAT5_PUB",
                        category_name="Patents Published",
                        research_points=2.0,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                else:
                    # Missing Tier 1: CAT4 (4.0) + CAT4 (4.0) + CAT5_GRANT (3.5) + CAT8 (2.0) = 13.5 pts
                    db.add(Publication(
                        doi=f"10.1007/ijis.{adm_year}.{scholar.id}01",
                        title=f"Security and Privacy Architecture for {scholar.research_area}",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_id=6,
                        journal_name="International Journal of Information Security",
                        issn="1615-5262",
                        publication_year=adm_year + 2,
                        publication_type="Journal",
                        is_scholar_first_or_corresponding=True,
                        quartile="Q2",
                        scopus_indexed=True,
                        category_code="CAT4",
                        category_name="SCOPUS / E-SCI Indexed Journal",
                        research_points=4.0,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                    db.add(Publication(
                        doi=f"10.1007/mta.{adm_year}.{scholar.id}02",
                        title=f"Empirical Benchmarking of {scholar.research_area} Models",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_id=5,
                        journal_name="Multimedia Tools and Applications",
                        issn="1380-7501",
                        publication_year=adm_year + 3,
                        publication_type="Journal",
                        is_scholar_first_or_corresponding=True,
                        category_code="CAT4",
                        category_name="SCOPUS / E-SCI Indexed Journal",
                        research_points=4.0,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                    db.add(Publication(
                        doi=f"IN-PATENT-GRANT-{scholar.id}03",
                        title=f"Embedded Intelligent Circuit for {scholar.research_area}",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        publication_year=adm_year + 3,
                        publication_type="Patent",
                        is_scholar_first_or_corresponding=True,
                        category_code="CAT5_GRANT",
                        category_name="Patents Granted (DC Approved)",
                        research_points=3.5,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
                    db.add(Publication(
                        doi=f"10.1145/conf.{adm_year}.{scholar.id}04",
                        title=f"Experimental Study in {scholar.research_area}",
                        authors=f"{scholar.name}, {supervisor.name}",
                        faculty_id=supervisor.id,
                        scholar_id=scholar.id,
                        journal_name="Refereed Int. Conference (DC Approved)",
                        publication_year=adm_year + 4,
                        publication_type="Conference",
                        is_scholar_first_or_corresponding=True,
                        category_code="CAT8",
                        category_name="Refereed International Conferences (DC Approved)",
                        research_points=2.0,
                        is_tier1_mandatory=False,
                        is_verified=True,
                        verification_status="Verified"
                    ))
            elif adm_year in [2022, 2023] and scholar.id % 2 == 0:
                # Early career outputs: CAT6 Conf (3.0 pts)
                db.add(Publication(
                    doi=f"10.1109/EARLY.{adm_year}.{scholar.id}01",
                    title=f"Preliminary Explorations in {scholar.research_area}",
                    authors=f"{scholar.name}, {supervisor.name}",
                    faculty_id=supervisor.id,
                    scholar_id=scholar.id,
                    journal_name="IEEE Int. Conference with Full Proceedings",
                    publication_year=adm_year + 1,
                    publication_type="Conference",
                    is_scholar_first_or_corresponding=True,
                    category_code="CAT6",
                    category_name="Refereed Int. Conference with Full Proceedings (High-Class Publisher)",
                    research_points=3.0,
                    is_tier1_mandatory=False,
                    is_verified=True,
                    verification_status="Verified"
                ))

    # 6. Seed Additional Faculty Publications (Agent 17 & 18)
    for sup_name, fac in faculty_map.items():
        p_extra = Publication(
            doi=f"10.1007/s00521-2023-{fac.id}",
            title=f"Novel Computational Intelligence and Optimization Paradigms for University Systems: A Perspective from VFSTR",
            authors=f"{fac.name}, et al.",
            faculty_id=fac.id,
            journal_id=3,
            journal_name="Neural Computing and Applications",
            issn="0941-0643",
            publication_year=2023,
            publication_type="Journal",
            is_scholar_first_or_corresponding=False,
            quartile="Q1",
            scopus_indexed=True,
            wos_indexed=True,
            citations_count=24,
            is_verified=True,
            verification_status="Verified"
        )
        db.add(p_extra)

    # Add a sample flagged predatory paper for demonstration in Agent 17 review queue
    flagged_p = Publication(
        doi="10.9999/instantpub.2024.001",
        title="Ultra Rapid Deep Learning for Real-Time Big Data Computation",
        authors="Dr. S. V. Phani Kumar, et al.",
        faculty_id=faculty_map["Dr. S. V. Phani Kumar"].id,
        journal_id=8,
        journal_name="Journal of Ambient Intelligence and Humanized Computing",
        issn="1868-5137",
        publication_year=2024,
        publication_type="Journal",
        quartile="Unranked",
        scopus_indexed=False,
        wos_indexed=False,
        citations_count=2,
        is_verified=False,
        verification_status="Flagged",
        is_flagged_predatory=True,
        flagged_reason="Published in delisted journal with peer review anomalies"
    )
    db.add(flagged_p)

    # 7. Seed Appraisal Rubric & Dossiers (Agent 59)
    rubric = AppraisalRubric(
        version_name="VFSTR Academic Appraisal Framework 2024",
        effective_from_year="2024-25",
        teaching_weight=0.35,
        research_weight=0.35,
        governance_weight=0.15,
        outreach_weight=0.15,
        is_active=True
    )
    db.add(rubric)

    # 8. Seed University KPIs (Agent 71)
    kpi_definitions = [
        {
            "domain": "Research & Innovation",
            "code": "RES-01",
            "title": "Q1/Q2 Scopus & WoS Publication Density",
            "formula": "Total Q1 & Q2 Indexed Journal Papers / Total Full-time Faculty",
            "owner": "Dean of Research",
            "freq": "Quarterly",
            "current": 2.85,
            "target": 3.00,
            "prior": 2.95,
            "unit": "Papers/Faculty",
            "trend": "Deteriorating",
            "status": "On_Target_Deteriorating", # Crucial Amber alert!
            "nirf": "RPC (Research & Professional Practice)",
            "naac": "Criteria 3.4 (Research Publications)",
            "alert": "EARLY WARNING: On target (2.85 >= 2.5 benchmark) but slight dip from 2.95 prior period. Accelerated faculty grant mentoring advised."
        },
        {
            "domain": "Doctoral Studies",
            "code": "DOC-01",
            "title": "On-Time PhD Milestone Progression Rate",
            "formula": "Non-stalled Scholars / Total Registered Scholars * 100",
            "owner": "Dean of Academic Research",
            "freq": "Monthly",
            "current": 84.5,
            "target": 90.0,
            "prior": 82.0,
            "unit": "%",
            "trend": "Improving",
            "status": "Off_Target_Improving",
            "nirf": "GPH (Graduation Outcome for PhD)",
            "naac": "Criteria 2.6 (Student Performance)",
            "alert": "RECOVERY: Milestone progression rate rising (+2.5%), heading toward 90% target."
        },
        {
            "domain": "Governance & Compliance",
            "code": "GOV-01",
            "title": "Supervisor Capacity Cap Adherence",
            "formula": "Supervisors within Regulatory Limits / Total Supervisors * 100",
            "owner": "Director IQAC",
            "freq": "Quarterly",
            "current": 88.0,
            "target": 95.0,
            "prior": 88.0,
            "unit": "%",
            "trend": "Stable",
            "status": "Off_Target_Improving",
            "nirf": "GOV (Institutional Governance & Resources)",
            "naac": "Criteria 6.2 (Strategy Implementation)",
            "alert": "Supervisory capacity over-allocations detected in key professors (Dr. S.V. Phanikumar, Dr. K.V. Krishna Kishore, Dr. D. Radha Rani). Rebalancing recommended."
        },
        {
            "domain": "Faculty Quality",
            "code": "FAC-01",
            "title": "Faculty Annual Appraisal Excellence Index",
            "formula": "Faculty Scoring >= 75 / Total Appraised Faculty * 100",
            "owner": "Dean of Faculty Affairs",
            "freq": "Annual",
            "current": 76.5,
            "target": 70.0,
            "prior": 72.0,
            "unit": "%",
            "trend": "Improving",
            "status": "On_Target_Improving",
            "nirf": "TLR (Teaching, Learning & Resources)",
            "naac": "Criteria 2.4 (Teacher Profile & Quality)",
            "alert": "Target exceeded: 76.5% of faculty achieved Commendable or Outstanding appraisal scores."
        },
        {
            "domain": "Accreditation Readiness",
            "code": "ACC-01",
            "title": "NIRF Research & Professional Practice (RPC) Projected Score",
            "formula": "Combined Metric [Publications (PU) + Quality (QP) + IPR + FPPP]",
            "owner": "Vice Chancellor / NIRF Committee",
            "freq": "Monthly",
            "current": 68.4,
            "target": 75.0,
            "prior": 65.0,
            "unit": "Points (0-100)",
            "trend": "Improving",
            "status": "Off_Target_Improving",
            "nirf": "NIRF Overall & Engineering Rank Matrix",
            "naac": "Criteria 3.1 (Resource Mobilization)",
            "alert": "RPC score forecast improved from 65.0 to 68.4, placing VFSTR in Top 75 ranking band trajectory."
        }
    ]

    for kdata in kpi_definitions:
        kpi = UniversityKPI(
            domain=kdata["domain"],
            code=kdata["code"],
            title=kdata["title"],
            formula=kdata["formula"],
            owner_role=kdata["owner"],
            reporting_frequency=kdata["freq"],
            current_value=kdata["current"],
            target_value=kdata["target"],
            prior_period_value=kdata["prior"],
            unit=kdata["unit"],
            trend=kdata["trend"],
            status=kdata["status"],
            nirf_framework_code=kdata["nirf"],
            naac_criteria=kdata["naac"],
            alert_message=kdata["alert"],
            lead_indicator_codes=["DOC-01"] if kdata["code"] == "RES-01" else [],
            lag_indicator_codes=["ACC-01"] if kdata["code"] == "RES-01" else []
        )
        db.add(kpi)

    db.commit()

    # Synchronize Agent 25 dual-condition publication status for all scholars
    print("[SEED] Synchronizing Agent 25 dual-condition publication evaluations for all scholars...")
    phd_agent = PhDMonitoringAgent(db)
    for s in db.query(PhDScholar).all():
        phd_agent.verify_publication_eligibility(s.id)

    db.commit()
    print("[SEED] Successfully populated database with 84 scholars, supervisors, committee rosters, journals, and KPIs!")
    db.close()

if __name__ == "__main__":
    import sys
    drop_flag = "--rebuild" in sys.argv or "-r" in sys.argv
    seed_database(drop_existing=drop_flag)
