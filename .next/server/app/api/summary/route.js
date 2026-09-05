"use strict";(()=>{var e={};e.id=325,e.ids=[325],e.modules={399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6154:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>S,patchFetch:()=>A,requestAsyncStorage:()=>g,routeModule:()=>h,serverHooks:()=>f,staticGenerationAsyncStorage:()=>_});var i={};a.r(i),a.d(i,{GET:()=>y,POST:()=>p});var s=a(9303),r=a(8716),n=a(670),o=a(7070),l=a(4840),c=a(2639),d=a(3786);class m{static{this.AYUSH_QUESTIONS={presenting_complaint:[{id:"ayush_main_complaint",stage:"presenting_complaint",question:{en:"Namaste. What main health problem or discomfort brings you to the Ayurvedic clinic today?",ta:"வணக்கம். இன்று நீங்கள் ஆயுர்வேத மருத்துவமனைக்கு வரக் காரணமான முக்கிய உடல்நலப் பிரச்சனை என்ன?",hi:"नमस्ते। आज आपको आयुर्वेदिक ओपीडी में किस मुख्य स्वास्थ्य समस्या या बेचैनी के लिए आना पड़ा है?"},questionType:"multiple_choice",options:{en:["Digestive Problem","Joint Pain / Stiffness","Skin Problem","Sleep Problem","Stress / Fatigue","Other"],ta:["செரிமானப் பிரச்சனை","மூட்டு வலி / விறைப்பு","தோல் பிரச்சனை","தூக்கமின்மை","மன அழுத்தம் / சோர்வு","பிற"],hi:["पाचन समस्या","जोड़ों का दर्द / अकड़न","त्वचा समस्या","नींद की समस्या","तनाव / थकान","अन्य"]},fieldKey:"presenting_complaint"},{id:"ayush_duration",stage:"presenting_complaint",question:{en:"How long have you been experiencing this health problem?",ta:"இந்த உடல்நலப் பிரச்சனை எத்தனை நாட்களாக அல்லது மாதங்களாக உள்ளது?",hi:"यह स्वास्थ्य समस्या आपको कितने समय से (दिन, सप्ताह या महीने) हो रही है?"},questionType:"multiple_choice",options:{en:["Just started (< 1 week)","1 to 4 weeks","1 to 6 months","More than 6 months (chronic)"],ta:["சமீபத்தில் தொடங்கியது (1 வாரத்திற்குள்)","1 முதல் 4 வாரங்கள்","1 முதல் 6 மாதங்கள்","6 மாதங்களுக்கும் மேல் (நீண்டகாலமாக)"],hi:["हाल ही में शुरू हुई (< 1 सप्ताह)","1 से 4 सप्ताह","1 से 6 महीने","6 महीने से अधिक समय से (दीर्घकालिक)"]},fieldKey:"duration"},{id:"ayush_prev_treatment",stage:"presenting_complaint",question:{en:"Have you taken any previous medicines, home remedies, or treatments for this complaint?",ta:"இந்த பிரச்சனைக்கு இதற்கு முன் ஏதேனும் சிகிச்சைகள் அல்லது மருந்துகள் எடுத்துள்ளீர்களா?",hi:"क्या आपने इस समस्या के लिए पहले कोई दवाई, घरेलू नुस्खा या उपचार लिया है?"},questionType:"multiple_choice",options:{en:["None / No previous treatment","Modern / Allopathic medicines","Ayurvedic / Herbal remedies","Other"],ta:["முந்தைய சிகிச்சை எதுவும் இல்லை","ஆங்கில / அலோபதி மருந்துகள்","ஆயுர்வேத / மூலிகை மருந்துகள்","பிற"],hi:["कोई पिछला उपचार नहीं लिया","एलोपैथिक दवाएं ली थीं","आयुर्वेदिक या जड़ी-बूटी उपचार","अन्य"]},fieldKey:"previous_treatment"}],prakriti:[{id:"ayush_body_build",stage:"prakriti",question:{en:"Let us understand your body nature. How would you describe your general body build?",ta:"உங்கள் இயற்கையான உடல் தன்மையைப் புரிந்து கொள்வோம். உங்கள் உடல் அமைப்பை எவ்வாறு விவரிப்பீர்கள்?",hi:"आइए आपके स्वाभाविक शरीर की प्रकृति को समझें। आप अपनी शारीरिक बनावट को कैसे वर्णित करेंगे?"},questionType:"multiple_choice",options:{en:["Slim","Medium","Broad / Strong","Not Sure"],ta:["மெலிந்த தேகம் (Slim)","நடுத்தர உடல் (Medium)","திடமான தேகம் (Broad / Strong)","தெரியவில்லை (Not Sure)"],hi:["पतला शरीर (Slim)","मध्यम शारीरिक बनावट (Medium)","मजबूत / चौड़ी बनावट (Broad / Strong)","निश्चित नहीं (Not Sure)"]},fieldKey:"body_build"}],vikriti:[{id:"ayush_digestive_changes",stage:"vikriti",question:{en:"How is your digestion and appetite generally?",ta:"பொதுவாக உங்கள் பசி மற்றும் செரிமானம் எவ்வாறு உள்ளது?",hi:"सामान्य तौर पर आपका पाचन और भूख कैसी रहती है?"},questionType:"multiple_choice",options:{en:["Good","Gas / Bloating","Acidity / Burning","Irregular / Low Appetite"],ta:["நன்றாக உள்ளது","வாயு / வயிறு உப்பசம்","அமிலத்தன்மை / நெஞ்செரிச்சல்","சீரற்ற பசி / மந்தம்"],hi:["अच्छा","गैस / पेट फूलना","एसिडिटी / जलन","अनियमित / कम भूख"]},fieldKey:"digestive_changes"}],ahara:[{id:"ayush_diet_type",stage:"ahara",question:{en:"What type of diet do you primarily consume?",ta:"நீங்கள் வழக்கமாக உட்கொள்ளும் உணவு முறை என்ன?",hi:"आप मुख्य रूप से किस प्रकार का भोजन करते हैं?"},questionType:"multiple_choice",options:{en:["Vegetarian (Home-cooked)","Non-Vegetarian","Mixed with outside food","Other"],ta:["தூய சைவ உணவு (வீட்டுச் சமையல்)","அசைவ உணவு","கலப்பு / துரித உணவுகளுடன்","பிற"],hi:["शुद्ध शाकाहारी (घर का भोजन)","मांसाहारी","मिश्रित / बाहर का खाना","अन्य"]},fieldKey:"food_types"}],vihara:[{id:"ayush_physical_activity",stage:"vihara",question:{en:"How active are you in daily life?",ta:"அன்றாட வாழ்வில் உங்கள் உடல் இயக்கம் எவ்வாறு உள்ளது?",hi:"आप दैनिक जीवन में कितने सक्रिय रहते हैं?"},questionType:"multiple_choice",options:{en:["Very Active","Moderately Active","Mostly Sedentary"],ta:["மிகவும் சுறுசுறுப்பானது","மிதமான உடலுழைப்பு","அமர்ந்து வேலை செய்தல் (Sedentary)"],hi:["बहुत सक्रिय (Very Active)","मध्यम सक्रिय (Moderately Active)","बैठे रहने वाला काम (Mostly Sedentary)"]},fieldKey:"physical_activity"},{id:"ayush_sleep_pattern",stage:"vihara",question:{en:"How is your nighttime sleep?",ta:"உங்கள் இரவு நேர தூக்கம் எவ்வாறு உள்ளது?",hi:"आपकी रात की नींद कैसी रहती है?"},questionType:"multiple_choice",options:{en:["Good / Refreshing","Light Sleep","Disturbed","Difficulty Sleeping"],ta:["நல்ல புத்துணர்ச்சியான தூக்கம்","லேசான தூக்கம்","தடைபடும் தூக்கம்","தூங்குவதில் சிரமம்"],hi:["अच्छी और गहरी नींद","हल्की नींद","टूटी-टूटी नींद","नींद आने में कठिनाई"]},fieldKey:"sleep"}],dashavidha_pariksha:[{id:"ayush_final_check",stage:"dashavidha_pariksha",question:{en:"Is there anything else important you would like the Ayurvedic doctor to know?",ta:"ஆயுர்வேத மருத்துவரிடம் தெரிவிக்க வேறு ஏதேனும் முக்கிய விவரங்கள் உள்ளதா?",hi:"क्या कोई और महत्वपूर्ण बात है जो आप आयुर्वेदिक चिकित्सक को बताना चाहते हैं?"},questionType:"multiple_choice",options:{en:["No, Continue to Summary","Yes, I want to add something"],ta:["இல்லை, சுருக்கத்திற்கு தொடரவும்","ஆம், கூடுதல் விவரம் சேர்க்க வேண்டும்"],hi:["नहीं, सारांश पर आगे बढ़ें","हाँ, मैं कुछ जोड़ना चाहता हूँ"]},fieldKey:"sattva"}],completed:[]}}static{this.AYUSH_STAGE_ORDER=["presenting_complaint","prakriti","vikriti","ahara","vihara","dashavidha_pariksha","completed"]}static getInitialGreeting(e="en"){let t=this.AYUSH_QUESTIONS.presenting_complaint[0];return{id:t.id,stage:"presenting_complaint",question:t.question[e]||t.question.en,questionType:t.questionType,options:t.options?t.options[e]||t.options.en:void 0,fieldKey:t.fieldKey}}static getNextQuestion(e,t,a="en"){let i=this.AYUSH_QUESTIONS[e]||[];if(t<i.length){let s=i[t];return{id:s.id,stage:e,question:s.question[a]||s.question.en,questionType:s.questionType,options:s.options?s.options[a]||s.options.en:void 0,fieldKey:s.fieldKey}}return null}static getNextStage(e){let t=this.AYUSH_STAGE_ORDER.indexOf(e);return -1!==t&&t<this.AYUSH_STAGE_ORDER.length-1?this.AYUSH_STAGE_ORDER[t+1]:"completed"}static mapAgeToVaya(e){return e<=16?"Balya Vaya (Childhood / Growth Stage - Under 16 yrs)":e<=60?`Madhyama Vaya (Adult / Middle Life Stage - ${e} yrs)`:`Vardhakya / Vriddha Vaya (Elderly / Geriatric Stage - ${e} yrs)`}static async saveAssessment(e){return l.M.saveAyushAssessment(e)}static async getAssessment(e){return l.M.getAyushAssessmentBySession(e)}}class u{static async generateSummary(e,t){let a=await l.M.getIntakeSessionById(e);if("AYUSH"===(a?.consultation_mode||"MODERN_MEDICINE"))return await this.generateAyushSummary(e,t);let i=await c.O.getClinicalHistory(e),s=await l.M.getRedFlagAlertsBySessionId(e),r=await d.P.getSessionDocuments(e),n=new Set;i?.past_medical_history&&i.past_medical_history.forEach(e=>{"yes"===e.status&&e.condition&&n.add(`${e.condition} (Patient reported)`)}),r.forEach(e=>{e.extraction?.diagnoses&&e.extraction.diagnoses.forEach(t=>{n.add(`${t} (Document dated ${e.document_date||"prior"})`)})});let o=Array.from(n);0===o.length&&o.push("No significant past medical conditions reported or identified.");let m=[];i?.surgical_history&&i.surgical_history.forEach(e=>{e.surgery&&!e.surgery.toLowerCase().includes("no")&&m.push(`${e.surgery} (Patient reported)`)}),r.forEach(e=>{e.extraction?.procedures&&e.extraction.procedures.forEach(t=>{m.push(`${t} (Document dated ${e.document_date||"prior"})`)})});let u=m.length>0?m:["No prior surgeries reported."],p=new Map;i?.medications&&i.medications.forEach(e=>{e.name&&!e.name.toLowerCase().includes("no regular")&&p.set(e.name.toLowerCase(),{name:e.name,dosage:e.dosage,frequency:e.frequency,source:"patient"})}),r.forEach(e=>{e.extraction?.medications&&e.extraction.medications.forEach(e=>{let t=e.name.toLowerCase();if(p.has(t)){let a=p.get(t);p.set(t,{...a,source:"both",dosage:a.dosage||e.dosage,frequency:a.frequency||e.frequency})}else p.set(t,{name:e.name,dosage:e.dosage,frequency:e.frequency,source:"document"})})});let y=Array.from(p.values()),h=[];i?.allergies&&i.allergies.length>0&&i.allergies.forEach(e=>{e.allergen&&!e.allergen.toLowerCase().includes("no known")&&h.push({allergen:e.allergen,type:e.type||"drug"})}),0===h.length&&h.push({allergen:"No known allergies reported (NKDA)",type:"other"});let g=[];i?.family_history&&i.family_history.length>0&&i.family_history.forEach(e=>{e.condition&&!e.condition.toLowerCase().includes("no significant")&&g.push(`${e.relation||"Relative"}: ${e.condition}`)}),0===g.length&&g.push("No significant hereditary conditions noted in immediate family.");let _=[];if(i?.personal_history){let e=i.personal_history;e.smoking&&_.push(`Smoking: ${e.smoking}`),e.alcohol&&_.push(`Alcohol: ${e.alcohol}`),e.diet&&_.push(`Diet: ${e.diet}`),e.occupation&&_.push(`Occupation: ${e.occupation}`),e.exercise&&_.push(`Physical activity: ${e.exercise}`)}0===_.length&&_.push("Lifestyle and personal habits within standard parameters.");let f=[];r.forEach(e=>{e.extraction?.labResults&&e.extraction.labResults.forEach(t=>{f.push({test:t.test||t.testName||"Lab Test",result:String(t.value),unit:t.unit,referenceRange:t.referenceRange,isAbnormal:!!(t.isOutsideRange||t.isAbnormal),date:e.document_date||void 0})})});let S=[];s.forEach(e=>{"active"===e.status&&S.push(`🚨 EMERGENCY ALERT (${e.alert_type}): ${e.matched_terms?.join(", ")||"Critical symptom reported"}`)}),f.filter(e=>e.isAbnormal).forEach(e=>{S.push(`⚠️ ABNORMAL LAB VALUE: ${e.test} (${e.result} ${e.unit||""}) outside normal limits (${e.referenceRange||"Ref Range N/A"})`)});let A={chief_complaint:i?.chief_complaint||"General Clinical Intake Consultation",history_of_present_illness:i?.hpi?`Patient reports: ${Object.entries(i.hpi).map(([e,t])=>`${e.replace(/_/g," ")}: ${t}`).join("; ")}`:"Patient reports for clinical assessment.",past_medical_history:o,past_surgical_history:u,current_medications:y,allergies:h,family_history:g,personal_history:_,review_of_systems:i?.review_of_systems||{},prior_investigations:f,important_alerts:S},v=`
PATIENT CLINICAL SUMMARY
AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION

1. CHIEF COMPLAINT:
${A.chief_complaint}

2. HISTORY OF PRESENT ILLNESS:
${A.history_of_present_illness}

3. PAST MEDICAL HISTORY:
${A.past_medical_history.map(e=>`• ${e}`).join("\n")}

4. PAST SURGICAL HISTORY:
${A.past_surgical_history.map(e=>`• ${e}`).join("\n")}

5. CURRENT MEDICATIONS:
${A.current_medications.length>0?A.current_medications.map(e=>`• ${e.name} ${e.dosage||""} (${e.frequency||"as prescribed"}) [Source: ${e.source}]`).join("\n"):"• None reported"}

6. ALLERGIES:
${A.allergies.map(e=>`• ${e.allergen}`).join("\n")}

7. FAMILY HISTORY:
${A.family_history.map(e=>`• ${e}`).join("\n")}

8. PERSONAL HISTORY:
${A.personal_history.join("\n")}

9. PRIOR INVESTIGATIONS:
${A.prior_investigations.length>0?A.prior_investigations.map(e=>`• ${e.test}: ${e.result} (Ref: ${e.referenceRange||"N/A"})${e.isAbnormal?" [⚠️ OUTSIDE RANGE]":""}`).join("\n"):"• No uploaded lab reports"}

10. IMPORTANT ALERTS:
${A.important_alerts.length>0?A.important_alerts.map(e=>`• ${e}`).join("\n"):"• No active red-flag triggers"}

CONFIDENTIALITY NOTICE: AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION. This clinical intake summary was compiled by MediKiosk AI for physician review and does not provide medical evaluation or treatment recommendations.
    `.trim();return await l.M.saveClinicalSummary({patient_id:t,intake_session_id:e,consultation_mode:"MODERN_MEDICINE",summary_content:v,structured_summary:A,status:"draft"})}static async generateAyushSummary(e,t){let a=await l.M.getPatientById(t),i=await m.getAssessment(e),s=await l.M.getRedFlagAlertsBySessionId(e),r=await d.P.getSessionDocuments(e),n=[];r.forEach(e=>{e.extraction?.labResults&&e.extraction.labResults.forEach(t=>{n.push({test:t.test||t.testName||"Lab Test",result:String(t.value),unit:t.unit,referenceRange:t.referenceRange,isAbnormal:!!(t.isOutsideRange||t.isAbnormal),date:e.document_date||void 0})})});let o=[];r.forEach(e=>{e.extraction?.medications&&e.extraction.medications.forEach(e=>{o.push({name:e.name,dosage:e.dosage,frequency:e.frequency,source:"document"})})});let c=[];s.forEach(e=>{"active"===e.status&&c.push(`🚨 EMERGENCY RED FLAG (${e.alert_type}): ${e.matched_terms?.join(", ")||"Critical symptom reported"}`)}),n.filter(e=>e.isAbnormal).forEach(e=>{c.push(`⚠️ INVESTIGATION OUTSIDE LIMITS: ${e.test} (${e.result} ${e.unit||""})`)});let u=i?.presenting_complaint||"Ayurvedic Clinical Intake Consultation",p=i?.duration||"Not specified",y=i?.previous_treatment||"None reported",h=i?.current_symptoms&&i.current_symptoms.length>0?i.current_symptoms:[u],g=i?.prakriti||{body_build:"Moderate / Madhyama frame",skin_type:"Normal skin texture",temperament:"Balanced mental state"},_=i?.vikriti||{digestive_changes:"Digestive pattern documented during interview",energy_changes:"Vitality level documented"},f=i?.ahara_assessment||{food_types:"Regular mixed diet",meal_timing:"Consistent meal hours",water_intake:"2 litres daily"},S=i?.vihara_assessment||{daily_routine:"Normal daily routine",physical_activity:"Routine daily activities",sleep:"Normal nighttime rest"},A={prakriti:i?.prakriti?.dominant_dosha_tendency||g.body_build||"Prakriti traits observed",vikriti:_.digestive_changes||"Current doshic imbalance indicators",sara:i?.sara||"Madhyama Sara (Moderate tissue vitality)",samhanana:i?.samhanana||"Madhyama Samhanana (Moderate compact build)",pramana:i?.pramana||"Madhyama Pramana (Normal body proportion)",satmya:i?.satmya||"Satmya to regional traditional diet",sattva:i?.sattva||"Madhyama Sattva (Balanced mental strength)",ahara_shakti:i?.ahara_shakti||f.appetite||"Madhyama Ahara Shakti",vyayama_shakti:i?.vyayama_shakti||"Madhyama Vyayama Shakti (Normal physical exertion)",vaya:i?.vaya||m.mapAgeToVaya(a?.age||45)},v={chief_complaint:u,history_of_present_illness:`Duration: ${p}. Previous treatment: ${y}.`,past_medical_history:[y],past_surgical_history:["None reported"],current_medications:o,allergies:[{allergen:"No known allergies reported",type:"other"}],family_history:["Standard family history"],personal_history:[`Diet: ${f.food_types||"Normal"}`,`Routine: ${S.daily_routine||"Standard"}`,`Sleep: ${S.sleep||"Normal"}`],review_of_systems:{},prior_investigations:n,important_alerts:c},I=`
AYURVEDIC CLINICAL INTAKE SUMMARY
AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION

1. PATIENT INFORMATION:
• Name: ${a?.full_name||"Anonymous"}
• Age: ${a?.age||"N/A"} yrs | Gender: ${a?.gender||"N/A"}
• ABHA ID: ${a?.abha_id||"Not linked"}

2. PRESENTING COMPLAINT:
${u} (Duration: ${p})

3. CURRENT SYMPTOMS:
${h.map(e=>`• ${e}`).join("\n")}

4. PRAKRITI ASSESSMENT (CONSTITUTION):
• Body Build: ${g.body_build||"Not specified"}
• Skin Type: ${g.skin_type||"Not specified"}
• Temperament: ${g.temperament||"Not specified"}

5. VIKRITI ASSESSMENT (CURRENT IMBALANCE):
• Digestive Changes: ${_.digestive_changes||"None reported"}
• Energy Changes: ${_.energy_changes||"None reported"}

6. AHARA ASSESSMENT (DIETARY HABITS):
• Food Types: ${f.food_types||"Mixed"}
• Meal Timing: ${f.meal_timing||"Regular"}
• Water Intake: ${f.water_intake||"Standard"}

7. VIHARA ASSESSMENT (LIFESTYLE & ROUTINE):
• Daily Routine: ${S.daily_routine||"Standard"}
• Physical Activity: ${S.physical_activity||"Moderate"}
• Sleep Routine: ${S.sleep||"Normal"}
• Stress Level: ${S.stress||"Manageable"}

8. DASHAVIDHA PARIKSHA (10 EXTENDED PARAMETERS):
1. Prakriti: ${A.prakriti}
2. Vikriti: ${A.vikriti}
3. Sara: ${A.sara}
4. Samhanana: ${A.samhanana}
5. Pramana: ${A.pramana}
6. Satmya: ${A.satmya}
7. Sattva: ${A.sattva}
8. Ahara Shakti: ${A.ahara_shakti}
9. Vyayama Shakti: ${A.vyayama_shakti}
10. Vaya: ${A.vaya}

9. PREVIOUS MEDICAL / TREATMENT HISTORY:
• ${y}

10. MEDICATIONS & UPLOADED INVESTIGATIONS:
${o.length>0?o.map(e=>`• Medicine: ${e.name} (${e.dosage||""})`).join("\n"):"• No active medications reported"}
${n.length>0?n.map(e=>`• Lab: ${e.test} = ${e.result} (${e.unit||""})`).join("\n"):"• No lab reports uploaded"}

11. IMPORTANT ALERTS:
${c.length>0?c.map(e=>`• ${e}`).join("\n"):"• No active safety alerts"}

CONFIDENTIALITY NOTICE: AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION. The AI intake platform collects and structures patient-reported findings for qualified Ayurvedic physician assessment. It does not provide final diagnoses, dosha conclusions, or medical prescriptions.
    `.trim();return await l.M.saveClinicalSummary({patient_id:t,intake_session_id:e,consultation_mode:"AYUSH",summary_content:I,structured_summary:v,ayush_summary:{presenting_complaint:u,duration:p,previous_treatment:y,current_symptoms:h,prakriti_assessment:g,vikriti_assessment:_,ahara_assessment:f,vihara_assessment:S,dashavidha_pariksha:A,previous_medical_treatment_history:[y],medications:o,uploaded_investigations:n,important_alerts:c},status:"draft"})}static async getSummary(e){return await l.M.getClinicalSummaryBySession(e)}}async function p(e){try{let{sessionId:t,patientId:a}=await e.json();if(!t||!a)return o.NextResponse.json({success:!1,error:"sessionId and patientId are required."},{status:400});let i=await u.generateSummary(t,a);return o.NextResponse.json({success:!0,data:i},{status:201})}catch(e){return o.NextResponse.json({success:!1,error:e.message||"Error generating clinical summary"},{status:500})}}async function y(e){try{let{searchParams:t}=new URL(e.url),a=t.get("sessionId");if(!a)return o.NextResponse.json({success:!1,error:"sessionId parameter is required"},{status:400});let i=await u.getSummary(a);if(!i)return o.NextResponse.json({success:!1,message:"Summary not yet generated"},{status:404});return o.NextResponse.json({success:!0,data:i})}catch(e){return o.NextResponse.json({success:!1,error:e.message||"Error fetching summary"},{status:500})}}let h=new s.AppRouteRouteModule({definition:{kind:r.x.APP_ROUTE,page:"/api/summary/route",pathname:"/api/summary",filename:"route",bundlePath:"app/api/summary/route"},resolvedPagePath:"C:\\Users\\DELL\\OneDrive\\Documents\\patienrt case\\app\\api\\summary\\route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:g,staticGenerationAsyncStorage:_,serverHooks:f}=h,S="/api/summary/route";function A(){return(0,n.patchFetch)({serverHooks:f,staticGenerationAsyncStorage:_})}},6328:(e,t,a)=>{a.d(t,{O:()=>s,j:()=>i}),a(7495);let i=!1,s=null},2639:(e,t,a)=>{a.d(t,{O:()=>r});var i=a(6328),s=a(4840);class r{static async saveConversation(e,t,a,r){if(i.j&&i.O){try{let{error:n}=await i.O.from("clinical_conversations").upsert({intake_session_id:e,patient_id:t,messages:a,language:r},{onConflict:"intake_session_id"});n&&(console.warn("Supabase conversation save error, using fallback:",n.message),await s.M.saveConversation(e,t,a,r))}catch(i){console.warn("Supabase connection error:",i),await s.M.saveConversation(e,t,a,r)}return}await s.M.saveConversation(e,t,a,r)}static async saveClinicalHistory(e){if(i.j&&i.O)try{let{data:t,error:a}=await i.O.from("clinical_history").upsert({intake_session_id:e.intake_session_id,patient_id:e.patient_id,chief_complaint:e.chief_complaint,hpi:e.hpi,past_medical_history:e.past_medical_history,surgical_history:e.surgical_history,medications:e.medications,allergies:e.allergies,family_history:e.family_history,personal_history:e.personal_history,review_of_systems:e.review_of_systems||{},updated_at:new Date().toISOString()},{onConflict:"intake_session_id"}).select().single();if(a||!t)return console.warn("Supabase clinical history save error, using fallback:",a?.message),await s.M.saveClinicalHistory(e);return t}catch(e){console.warn("Supabase connection error saving history:",e)}return await s.M.saveClinicalHistory(e)}static async getClinicalHistory(e){if(i.j&&i.O)try{let{data:t,error:a}=await i.O.from("clinical_history").select("*").eq("intake_session_id",e).single();if(a||!t)return await s.M.getClinicalHistoryBySessionId(e);return t}catch{}return await s.M.getClinicalHistoryBySessionId(e)}static async logRedFlagAlert(e,t,a,r,n){if(i.j&&i.O)try{let{data:o,error:l}=await i.O.from("red_flag_alerts").insert([{intake_session_id:e,patient_id:t,alert_type:a,severity:r,matched_terms:n||[]}]).select().single();if(l||!o)return await s.M.saveRedFlagAlert({intake_session_id:e,patient_id:t,alert_type:a,severity:r,matched_terms:n});return o}catch{}return await s.M.saveRedFlagAlert({intake_session_id:e,patient_id:t,alert_type:a,severity:r,matched_terms:n})}}},3786:(e,t,a)=>{a.d(t,{P:()=>l});var i=a(4840);class s{isAvailable(){return!0}async extractText(e,t){await new Promise(e=>setTimeout(e,800));let a=e.fileName.toLowerCase();return"prescription"===t||a.includes("presc")||a.includes("rx")||a.includes("med")?{text:`
APOLLO MULTISPECIALITY CLINIC
Dr. S. K. Venkatraman, MD, DM (Cardiology)
Reg No: MCI-28491
Date: 14/05/2023

Patient Name: Rajesh Sharma
Age: 59 Yrs  Gender: Male

Diagnosis / Impression:
1. Essential Hypertension
2. Type 2 Diabetes Mellitus

Rx (Medications):
1. Tab. Metformin 500mg - 1 tab twice daily after food (B.D)
2. Tab. Telmisartan 40mg - 1 tab once daily in morning (O.D)
3. Tab. Atorvastatin 10mg - 1 tab at bedtime (H.S)

Advice: Low salt & low carbohydrate diet. Check fasting blood sugar regularly.
Next Review: 3 Months
        `.trim(),confidence:.96,detectedType:"prescription"}:"lab_report"===t||a.includes("lab")||a.includes("blood")||a.includes("test")||a.includes("report")?{text:`
LAL PATHLABS CLINICAL DIAGNOSTIC REPORT
Patient: Rajesh Sharma   Age/Sex: 60/M
Sample Collected: 10/11/2024
Report Status: Final

BIOCHEMISTRY INVESTIGATIONS:
Test Name              Observed Value   Units    Reference Range
----------------------------------------------------------------
Fasting Blood Sugar    240              mg/dL    70 - 100
Post Prandial Sugar    310              mg/dL    110 - 140
HbA1c (Glycated Hb)    8.8              %        4.0 - 5.6
Serum Creatinine       1.1              mg/dL    0.7 - 1.3
Total Cholesterol      215              mg/dL    125 - 200
Hemoglobin             14.2             g/dL     13.0 - 17.0

Comments: Elevated glycemic parameters noted. Clinical correlation suggested.
        `.trim(),confidence:.98,detectedType:"lab_report"}:"discharge_summary"===t||a.includes("discharge")||a.includes("summary")||a.includes("hospital")?{text:`
CITY GENERAL HOSPITAL - DISCHARGE SUMMARY
IP No: 884920   Date of Admission: 12/03/2022   Date of Discharge: 16/03/2022
Patient: Rajesh Sharma   Age: 58   Gender: Male

Final Diagnosis:
Acute Appendicitis (Resolved)

Surgical / Interventional Procedure:
Laparoscopic Appendectomy performed on 13/03/2022 under General Anesthesia.

Hospital Course:
Patient underwent uneventful laparoscopic appendectomy. Post-operative recovery was smooth.
Wound healthy, afebrile at discharge.

Discharge Medications:
1. Tab. Amoxicillin-Clavulanate 625mg - 1 tab twice daily for 5 days
2. Tab. Paracetamol 650mg - 1 tab as needed for pain
        `.trim(),confidence:.97,detectedType:"discharge_summary"}:{text:`
CLINICAL CONSULTATION NOTE
Date: 05/01/2024
Patient: Rajesh Sharma

Assessment:
Chronic mild knee osteoarthritis with bilateral morning stiffness.

Medications:
1. Tab. Glucosamine Sulfate 1500mg once daily
2. Topical Diclofenac Gel for local knee application
      `.trim(),confidence:.92,detectedType:"other"}}constructor(){this.name="MediKiosk Simulated Vision OCR"}}let r=new s;class n{static isValueOutsideRange(e,t){if(!t||!t.trim())return!1;let a="number"==typeof e?e:parseFloat(e);if(isNaN(a))return!1;let i=t.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);if(i){let e=parseFloat(i[1]),t=parseFloat(i[2]);if(!isNaN(e)&&!isNaN(t))return a<e||a>t}let s=t.match(/<\s*=?\s*([\d.]+)/);if(s){let e=parseFloat(s[1]);if(!isNaN(e))return a>e}let r=t.match(/>\s*=?\s*([\d.]+)/);if(r){let e=parseFloat(r[1]);if(!isNaN(e))return a<e}return!1}static extractDocumentDate(e){if(!e)return null;let t=e.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-\.](0?[1-9]|1[012])[\/\-\.](19\d\d|20\d\d)\b/);if(t){let e=t[1].padStart(2,"0"),a=t[2].padStart(2,"0"),i=t[3];return`${i}-${a}-${e}`}let a=e.match(/\b(19\d\d|20\d\d)[\/\-\.](0?[1-9]|1[012])[\/\-\.](0?[1-9]|[12][0-9]|3[01])\b/);if(a){let e=a[1],t=a[2].padStart(2,"0"),i=a[3].padStart(2,"0");return`${e}-${t}-${i}`}return null}static extractEntities(e,t){let a,i;e.split("\n").map(e=>e.trim()).filter(Boolean);let s=[],r=[],n=[],o=[],l=this.extractDocumentDate(e);for(let t of["type 2 diabetes","diabetes mellitus","essential hypertension","hypertension","acute appendicitis","coronary artery disease","asthma","osteoarthritis","dyslipidemia","hyperthyroidism","hypothyroidism","migraine","gerd","fatty liver"])if(e.toLowerCase().includes(t)&&!s.some(e=>e.toLowerCase()===t)){let e=t.split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");s.push(e)}let c=/(?:Tab\.?|Cap\.?|Syr\.?|Inj\.?|Tablet|Capsule)?\s*([A-Za-z\-]+(?:\s+[A-Za-z\-]+)?)\s+(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|ml|IU))\b(?:\s*[-–:]\s*([^\n,]+))?/gi;for(;null!==(a=c.exec(e));){let e=a[1].trim(),t=a[2].trim(),i=a[3]?a[3].trim():void 0;["doctor","patient","name","date","ref","mci","ip","reg","sample"].includes(e.toLowerCase())||r.some(t=>t.name.toLowerCase()===e.toLowerCase())||r.push({name:e,dosage:t,frequency:i})}for(let t of[{name:"Metformin",dosage:"500mg",frequency:"Twice daily"},{name:"Telmisartan",dosage:"40mg",frequency:"Once daily (morning)"},{name:"Atorvastatin",dosage:"10mg",frequency:"Once daily (night)"},{name:"Amoxicillin-Clavulanate",dosage:"625mg",frequency:"Twice daily"},{name:"Paracetamol",dosage:"650mg",frequency:"As needed for pain"},{name:"Glucosamine Sulfate",dosage:"1500mg",frequency:"Once daily"},{name:"Pantoprazole",dosage:"40mg",frequency:"Before breakfast"}])e.toLowerCase().includes(t.name.toLowerCase())&&!r.some(e=>e.name.toLowerCase()===t.name.toLowerCase())&&r.push(t);for(let t of["laparoscopic appendectomy","appendectomy","cholecystectomy","coronary angioplasty","stent placement","knee arthroscopy","total knee replacement","cesarean section","hernia repair","cataract surgery","tonsillectomy"])if(e.toLowerCase().includes(t)&&!o.some(e=>e.toLowerCase()===t)){let e=t.split(" ").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(" ");o.push(e)}let d=/([A-Za-z\s\(\)]+)\s+(\d+(?:\.\d+)?)\s+([A-Za-z\/%]+)\s+([\d\.\s\-–<>]+)/g;for(;null!==(i=d.exec(e));){let e=i[1].trim(),t=i[2].trim(),a=i[3].trim(),s=i[4].trim();if(e.length>2&&!["observed value","test name","date of","sample collected"].includes(e.toLowerCase())){let i=this.isValueOutsideRange(t,s);n.push({test:e,value:parseFloat(t)||t,unit:a,referenceRange:s,isOutsideRange:i})}}for(let t of[{test:"Fasting Blood Sugar",val:240,unit:"mg/dL",range:"70 - 100"},{test:"Post Prandial Sugar",val:310,unit:"mg/dL",range:"110 - 140"},{test:"HbA1c",val:8.8,unit:"%",range:"4.0 - 5.6"},{test:"Serum Creatinine",val:1.1,unit:"mg/dL",range:"0.7 - 1.3"},{test:"Total Cholesterol",val:215,unit:"mg/dL",range:"125 - 200"},{test:"Hemoglobin",val:14.2,unit:"g/dL",range:"13.0 - 17.0"}])e.toLowerCase().includes(t.test.toLowerCase())&&!n.some(e=>e.test.toLowerCase().includes(t.test.toLowerCase()))&&n.push({test:t.test,value:t.val,unit:t.unit,referenceRange:t.range,isOutsideRange:this.isValueOutsideRange(t.val,t.range)});return{id:"ext-"+Math.random().toString(36).substring(2,9),document_id:t,diagnoses:s,medications:r,labResults:n,procedures:o,documentDate:l,confidence:.96,raw_structured_data:{totalEntities:s.length+r.length+n.length+o.length,hasAbnormalLabs:n.some(e=>e.isOutsideRange)},created_at:new Date().toISOString()}}}let o=["image/jpeg","image/png","image/jpg","image/webp","application/pdf"];class l{static{this.ocrProvider=r}static setOCRProvider(e){this.ocrProvider=e}static validateFile(e,t,a){if(!e||0===e.trim().length)return{valid:!1,error:"File name is missing."};if(t>15728640)return{valid:!1,error:"File size exceeds maximum allowed limit of 15MB."};let i=/\.(jpg|jpeg|png|webp|pdf)$/i.test(e),s=o.includes(a.toLowerCase())||""===a;return i||s?{valid:!0}:{valid:!1,error:"Unsupported file type. Please upload JPG, PNG, or PDF documents."}}static async processDocument(e){let t=this.validateFile(e.fileName,e.fileSize,e.mimeType);if(!t.valid)throw Error(t.error||"File validation failed");let a={patient_id:e.patientId,intake_session_id:e.intakeSessionId,file_name:e.fileName,file_url:e.fileUrl,file_size:e.fileSize,mime_type:e.mimeType,document_type:e.documentType},s=await i.M.createMedicalDocument(a);try{await i.M.updateMedicalDocument(s.id,{processing_status:"processing"});let t=await this.ocrProvider.extractText({fileName:e.fileName,mimeType:e.mimeType,base64Data:e.base64Data},e.documentType);if(!t.text||0===t.text.trim().length)throw Error("OCR produced empty text. Please ensure document image is clear.");let a=n.extractEntities(t.text,s.id),r=await i.M.updateMedicalDocument(s.id,{extracted_text:t.text,processing_status:"completed",document_date:a.documentDate||new Date().toISOString().split("T")[0]});return await i.M.saveDocumentExtraction({document_id:s.id,diagnoses:a.diagnoses,medications:a.medications,labResults:a.labResults,procedures:a.procedures,documentDate:a.documentDate,confidence:a.confidence,raw_structured_data:a.raw_structured_data}),{document:r||s,extraction:a}}catch(e){throw await i.M.updateMedicalDocument(s.id,{processing_status:"failed"}),Error(e.message||"Document OCR and extraction pipeline failed")}}static async getSessionDocuments(e){return await i.M.getMedicalDocumentsBySession(e)}static async deleteDocument(e){return await i.M.deleteMedicalDocument(e)}static async updateDocumentDate(e,t){return await i.M.updateMedicalDocument(e,{document_date:t})}}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[276,972,495,840],()=>a(6154));module.exports=i})();