"use strict";exports.id=89,exports.ids=[89],exports.modules={5354:(e,a,t)=>{t.d(a,{c:()=>o});var i=t(7925),s=t(6781),r=t(3501),n=t(7983);class o{static async generateSummary(e,a){let t=await i.M.getIntakeSessionById(e);if("AYUSH"===(t?.consultation_mode||"MODERN_MEDICINE"))return await this.generateAyushSummary(e,a);let n=await s.ClinicalService.getClinicalHistory(e),o=await i.M.getRedFlagAlertsBySessionId(e),l=await r.P.getSessionDocuments(e),m=new Set;n?.past_medical_history&&n.past_medical_history.forEach(e=>{"yes"===e.status&&e.condition&&m.add(`${e.condition} (Patient reported)`)}),l.forEach(e=>{e.extraction?.diagnoses&&e.extraction.diagnoses.forEach(a=>{m.add(`${a} (Document dated ${e.document_date||"prior"})`)})});let c=Array.from(m);0===c.length&&c.push("No significant past medical conditions reported or identified.");let d=[];n?.surgical_history&&n.surgical_history.forEach(e=>{e.surgery&&!e.surgery.toLowerCase().includes("no")&&d.push(`${e.surgery} (Patient reported)`)}),l.forEach(e=>{e.extraction?.procedures&&e.extraction.procedures.forEach(a=>{d.push(`${a} (Document dated ${e.document_date||"prior"})`)})});let u=d.length>0?d:["No prior surgeries reported."],p=new Map;n?.medications&&n.medications.forEach(e=>{e.name&&!e.name.toLowerCase().includes("no regular")&&p.set(e.name.toLowerCase(),{name:e.name,dosage:e.dosage,frequency:e.frequency,source:"patient"})}),l.forEach(e=>{e.extraction?.medications&&e.extraction.medications.forEach(e=>{let a=e.name.toLowerCase();if(p.has(a)){let t=p.get(a);p.set(a,{...t,source:"both",dosage:t.dosage||e.dosage,frequency:t.frequency||e.frequency})}else p.set(a,{name:e.name,dosage:e.dosage,frequency:e.frequency,source:"document"})})});let h=Array.from(p.values()),y=[];n?.allergies&&n.allergies.length>0&&n.allergies.forEach(e=>{e.allergen&&!e.allergen.toLowerCase().includes("no known")&&y.push({allergen:e.allergen,type:e.type||"drug"})}),0===y.length&&y.push({allergen:"No known allergies reported (NKDA)",type:"other"});let _=[];n?.family_history&&n.family_history.length>0&&n.family_history.forEach(e=>{e.condition&&!e.condition.toLowerCase().includes("no significant")&&_.push(`${e.relation||"Relative"}: ${e.condition}`)}),0===_.length&&_.push("No significant hereditary conditions noted in immediate family.");let g=[];if(n?.personal_history){let e=n.personal_history;e.smoking&&g.push(`Smoking: ${e.smoking}`),e.alcohol&&g.push(`Alcohol: ${e.alcohol}`),e.diet&&g.push(`Diet: ${e.diet}`),e.occupation&&g.push(`Occupation: ${e.occupation}`),e.exercise&&g.push(`Physical activity: ${e.exercise}`)}0===g.length&&g.push("Lifestyle and personal habits within standard parameters.");let A=[];l.forEach(e=>{e.extraction?.labResults&&e.extraction.labResults.forEach(a=>{A.push({test:a.test||a.testName||"Lab Test",result:String(a.value),unit:a.unit,referenceRange:a.referenceRange,isAbnormal:!!(a.isOutsideRange||a.isAbnormal),date:e.document_date||void 0})})});let E=[];o.forEach(e=>{"active"===e.status&&E.push(`🚨 EMERGENCY ALERT (${e.alert_type}): ${e.matched_terms?.join(", ")||"Critical symptom reported"}`)}),A.filter(e=>e.isAbnormal).forEach(e=>{E.push(`⚠️ ABNORMAL LAB VALUE: ${e.test} (${e.result} ${e.unit||""}) outside normal limits (${e.referenceRange||"Ref Range N/A"})`)});let I={chief_complaint:n?.chief_complaint||"General Clinical Intake Consultation",history_of_present_illness:n?.hpi?`Patient reports: ${Object.entries(n.hpi).map(([e,a])=>`${e.replace(/_/g," ")}: ${a}`).join("; ")}`:"Patient reports for clinical assessment.",past_medical_history:c,past_surgical_history:u,current_medications:h,allergies:y,family_history:_,personal_history:g,review_of_systems:n?.review_of_systems||{},prior_investigations:A,important_alerts:E},S=`
PATIENT CLINICAL SUMMARY
AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION

1. CHIEF COMPLAINT:
${I.chief_complaint}

2. HISTORY OF PRESENT ILLNESS:
${I.history_of_present_illness}

3. PAST MEDICAL HISTORY:
${I.past_medical_history.map(e=>`• ${e}`).join("\n")}

4. PAST SURGICAL HISTORY:
${I.past_surgical_history.map(e=>`• ${e}`).join("\n")}

5. CURRENT MEDICATIONS:
${I.current_medications.length>0?I.current_medications.map(e=>`• ${e.name} ${e.dosage||""} (${e.frequency||"as prescribed"}) [Source: ${e.source}]`).join("\n"):"• None reported"}

6. ALLERGIES:
${I.allergies.map(e=>`• ${e.allergen}`).join("\n")}

7. FAMILY HISTORY:
${I.family_history.map(e=>`• ${e}`).join("\n")}

8. PERSONAL HISTORY:
${I.personal_history.join("\n")}

9. PRIOR INVESTIGATIONS:
${I.prior_investigations.length>0?I.prior_investigations.map(e=>`• ${e.test}: ${e.result} (Ref: ${e.referenceRange||"N/A"})${e.isAbnormal?" [⚠️ OUTSIDE RANGE]":""}`).join("\n"):"• No uploaded lab reports"}

10. IMPORTANT ALERTS:
${I.important_alerts.length>0?I.important_alerts.map(e=>`• ${e}`).join("\n"):"• No active red-flag triggers"}

CONFIDENTIALITY NOTICE: AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION. This clinical intake summary was compiled by MediKiosk AI for physician review and does not provide medical evaluation or treatment recommendations.
    `.trim();return await i.M.saveClinicalSummary({patient_id:a,intake_session_id:e,consultation_mode:"MODERN_MEDICINE",summary_content:S,structured_summary:I,status:"draft"})}static async generateAyushSummary(e,a){let t=await i.M.getPatientById(a),s=await n._.getAssessment(e),o=await i.M.getRedFlagAlertsBySessionId(e),l=await r.P.getSessionDocuments(e),m=[];l.forEach(e=>{e.extraction?.labResults&&e.extraction.labResults.forEach(a=>{m.push({test:a.test||a.testName||"Lab Test",result:String(a.value),unit:a.unit,referenceRange:a.referenceRange,isAbnormal:!!(a.isOutsideRange||a.isAbnormal),date:e.document_date||void 0})})});let c=[];l.forEach(e=>{e.extraction?.medications&&e.extraction.medications.forEach(e=>{c.push({name:e.name,dosage:e.dosage,frequency:e.frequency,source:"document"})})});let d=[];o.forEach(e=>{"active"===e.status&&d.push(`🚨 EMERGENCY RED FLAG (${e.alert_type}): ${e.matched_terms?.join(", ")||"Critical symptom reported"}`)}),m.filter(e=>e.isAbnormal).forEach(e=>{d.push(`⚠️ INVESTIGATION OUTSIDE LIMITS: ${e.test} (${e.result} ${e.unit||""})`)});let u=s?.presenting_complaint||"Ayurvedic Clinical Intake Consultation",p=s?.duration||"Not specified",h=s?.previous_treatment||"None reported",y=s?.current_symptoms&&s.current_symptoms.length>0?s.current_symptoms:[u],_=s?.prakriti||{body_build:"Moderate / Madhyama frame",skin_type:"Normal skin texture",temperament:"Balanced mental state"},g=s?.vikriti||{digestive_changes:"Digestive pattern documented during interview",energy_changes:"Vitality level documented"},A=s?.ahara_assessment||{food_types:"Regular mixed diet",meal_timing:"Consistent meal hours",water_intake:"2 litres daily"},E=s?.vihara_assessment||{daily_routine:"Normal daily routine",physical_activity:"Routine daily activities",sleep:"Normal nighttime rest"},I={prakriti:s?.prakriti?.dominant_dosha_tendency||_.body_build||"Prakriti traits observed",vikriti:g.digestive_changes||"Current doshic imbalance indicators",sara:s?.sara||"Madhyama Sara (Moderate tissue vitality)",samhanana:s?.samhanana||"Madhyama Samhanana (Moderate compact build)",pramana:s?.pramana||"Madhyama Pramana (Normal body proportion)",satmya:s?.satmya||"Satmya to regional traditional diet",sattva:s?.sattva||"Madhyama Sattva (Balanced mental strength)",ahara_shakti:s?.ahara_shakti||A.appetite||"Madhyama Ahara Shakti",vyayama_shakti:s?.vyayama_shakti||"Madhyama Vyayama Shakti (Normal physical exertion)",vaya:s?.vaya||n._.mapAgeToVaya(t?.age||45)},S={chief_complaint:u,history_of_present_illness:`Duration: ${p}. Previous treatment: ${h}.`,past_medical_history:[h],past_surgical_history:["None reported"],current_medications:c,allergies:[{allergen:"No known allergies reported",type:"other"}],family_history:["Standard family history"],personal_history:[`Diet: ${A.food_types||"Normal"}`,`Routine: ${E.daily_routine||"Standard"}`,`Sleep: ${E.sleep||"Normal"}`],review_of_systems:{},prior_investigations:m,important_alerts:d},N=`
AYURVEDIC CLINICAL INTAKE SUMMARY
AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION

1. PATIENT INFORMATION:
• Name: ${t?.full_name||"Anonymous"}
• Age: ${t?.age||"N/A"} yrs | Gender: ${t?.gender||"N/A"}
• ABHA ID: ${t?.abha_id||"Not linked"}

2. PRESENTING COMPLAINT:
${u} (Duration: ${p})

3. CURRENT SYMPTOMS:
${y.map(e=>`• ${e}`).join("\n")}

4. PRAKRITI ASSESSMENT (CONSTITUTION):
• Body Build: ${_.body_build||"Not specified"}
• Skin Type: ${_.skin_type||"Not specified"}
• Temperament: ${_.temperament||"Not specified"}

5. VIKRITI ASSESSMENT (CURRENT IMBALANCE):
• Digestive Changes: ${g.digestive_changes||"None reported"}
• Energy Changes: ${g.energy_changes||"None reported"}

6. AHARA ASSESSMENT (DIETARY HABITS):
• Food Types: ${A.food_types||"Mixed"}
• Meal Timing: ${A.meal_timing||"Regular"}
• Water Intake: ${A.water_intake||"Standard"}

7. VIHARA ASSESSMENT (LIFESTYLE & ROUTINE):
• Daily Routine: ${E.daily_routine||"Standard"}
• Physical Activity: ${E.physical_activity||"Moderate"}
• Sleep Routine: ${E.sleep||"Normal"}
• Stress Level: ${E.stress||"Manageable"}

8. DASHAVIDHA PARIKSHA (10 EXTENDED PARAMETERS):
1. Prakriti: ${I.prakriti}
2. Vikriti: ${I.vikriti}
3. Sara: ${I.sara}
4. Samhanana: ${I.samhanana}
5. Pramana: ${I.pramana}
6. Satmya: ${I.satmya}
7. Sattva: ${I.sattva}
8. Ahara Shakti: ${I.ahara_shakti}
9. Vyayama Shakti: ${I.vyayama_shakti}
10. Vaya: ${I.vaya}

9. PREVIOUS MEDICAL / TREATMENT HISTORY:
• ${h}

10. MEDICATIONS & UPLOADED INVESTIGATIONS:
${c.length>0?c.map(e=>`• Medicine: ${e.name} (${e.dosage||""})`).join("\n"):"• No active medications reported"}
${m.length>0?m.map(e=>`• Lab: ${e.test} = ${e.result} (${e.unit||""})`).join("\n"):"• No lab reports uploaded"}

11. IMPORTANT ALERTS:
${d.length>0?d.map(e=>`• ${e}`).join("\n"):"• No active safety alerts"}

CONFIDENTIALITY NOTICE: AI-GENERATED DRAFT — REQUIRES PHYSICIAN VERIFICATION. The AI intake platform collects and structures patient-reported findings for qualified Ayurvedic physician assessment. It does not provide final diagnoses, dosha conclusions, or medical prescriptions.
    `.trim();return await i.M.saveClinicalSummary({patient_id:a,intake_session_id:e,consultation_mode:"AYUSH",summary_content:N,structured_summary:S,ayush_summary:{presenting_complaint:u,duration:p,previous_treatment:h,current_symptoms:y,prakriti_assessment:_,vikriti_assessment:g,ahara_assessment:A,vihara_assessment:E,dashavidha_pariksha:I,previous_medical_treatment_history:[h],medications:c,uploaded_investigations:m,important_alerts:d},status:"draft"})}static async getSummary(e){return await i.M.getClinicalSummaryBySession(e)}}},9997:(e,a,t)=>{t.d(a,{Z:()=>i});let i=(0,t(9664).Z)("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]])}};