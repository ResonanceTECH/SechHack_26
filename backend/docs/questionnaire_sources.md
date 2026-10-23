# Validated sources for questionnaire item wording

This file documents the sources used for the Russian item wording currently stored in
`backend/app/core/questionnaire_registry.py`.

## PHQ-9
- Original instrument: Kroenke K., Spitzer R.L., Williams J.B. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.
- Russian clinical use: validated Russian translations are used in Russian clinical guidelines and psychiatric practice; current item wording follows the standard Russian PHQ-9 item set.
- Russian validation sources:
  - Zolotareva A.A. Diagnosis of Depression: Psychometric Examination of the Russian Version of the Patient Health Questionnaire (PHQ-9). Clinical Psychology and Special Education. 2023;12(4). https://psyjournals.ru/en/journals/cpse/archive/2023_n4/Zolotareva
  - Pogosova G.V. et al. Russian version of PHQ-2 and PHQ-9 questionnaires: sensitivity and specificity in detection of depression in outpatient general medical practice. Cardiovascular Therapy and Prevention. 2014;13(3):18-24. https://cardiovascular.elpub.ru/jour/article/view/51
  - Russian clinical guideline "Depressive episode, recurrent depressive disorder" (Ministry of Health of Russia) — uses PHQ-9 as screening tool.
- Source used for verification: Russian clinical guideline / psychiatric practice materials and the standard 9 PHQ-9 items.

## GAD-7
- Original instrument: Spitzer R.L., Kroenke K., Williams J.B., Lowe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.
- Russian clinical use: standard Russian GAD-7 translation used in clinical practice.
- Russian validation sources:
  - Zolotareva A.A. Adaptation of the GAD-7 and GAD-2 questionnaires into Russian. Clinical Psychology and Special Education. 2023;12(1). https://psyjournals.ru/en/journals/cpse/archive/2023_n1/Zolotareva
  - Russian clinical guideline "Anxiety disorders in adults" (Ministry of Health of Russia) — uses GAD-7 as screening tool.
- Source used for verification: standard Russian GAD-7 item set.

## HCL-8
- Derived from: Angst J., Adolfsson R., Benazzi F. et al. The HCL-32: Towards a self-assessment tool for hypomanic symptoms in outpatients. J Affect Disord. 2005;88(2):217-233.
- Russian validation: Mosolov S.N. et al. Validation of the Russian version of HCL-32. Social and Clinical Psychiatry. 2015;25(1):22-30.
- Russian official text: Russian clinical guidelines "Bipolar affective disorder" (Ministry of Health of Russia), Appendix G3, HCL-32. https://sudact.ru/law/klinicheskie-rekomendatsii-bipoliarnoe-affektivnoe-rasstroistvo-utv-minzdravom/prilozhenie-g3-gn/prilozhenie-g3/
- Note: HCL-8 is a short 8-item hypomania domain checklist based on HCL-32 symptom domains. It is not a separately validated full instrument; item wording is an abbreviated clinical summary.

## HCL-33
- Derived from: Angst J. et al. The HCL-32 / HCL-33 hypomania checklist family.
- Russian official text: Russian clinical guidelines "Bipolar affective disorder" (Ministry of Health of Russia), Appendix G3, HCL-32 (image-based in the published document). https://sudact.ru/law/klinicheskie-rekomendatsii-bipoliarnoe-affektivnoe-rasstroistvo-utv-minzdravom/prilozhenie-g3-gn/prilozhenie-g3/
- Status: item-level Russian wording is still a placeholder because the official HCL-32 item text is embedded as an image in the published guideline and was not extractable in this session.

## C-SSRS
- Original instrument: Posner K. et al. The Columbia-Suicide Severity Rating Scale (C-SSRS): initial validity and internal consistency findings. Am J Psychiatry. 2011;168(12):1266-1277.
- Russian official text: Russian clinical guidelines "Bipolar affective disorder" (Ministry of Health of Russia), Appendix G1, Columbia Suicide Severity Rating Scale.
- Source URL: https://sudact.ru/law/klinicheskie-rekomendatsii-bipoliarnoe-affektivnoe-rasstroistvo-utv-minzdravom/prilozhenie-g1-gn/prilozhenie-g1/kolumbiiskaia-shkala-otsenki-tiazhesti-suitsida/

## PDSS
- Original instrument: Shear M.K., Brown T.A., Barlow D.H. et al. Multicenter collaborative panic disorder severity scale. Am J Psychiatry. 1997;154(11):1571-1575.
- Russian adaptation: Fedotov I.A. Panic Disorder Severity Scale. In: Clinical Psychometrics (ed. Soldatkin V.A.). Moscow: Knorus; 2022.
- Russian official text: Russian clinical guidelines "Panic disorder" (Ministry of Health of Russia, 2024), Appendix 2, PDSS.
- Source URL: https://base.garant.ru/410407475/37f2c5776c509d4d338445ec97a7d852/

## ISI
- Original instrument: Bastien C.H., Vallieres A., Morin C.M. Validation of the Insomnia Severity Index as an outcome measure for insomnia research. Sleep Med. 2001;2(4):297-307.
- Russian clinical use: standard Russian ISI translation used in sleep medicine and psychiatry.
- Russian validation sources:
  - Russian clinical guideline "Insomnia in adults" (Ministry of Health of Russia) — uses ISI as outcome measure.
  - Standard Russian ISI item set used in sleep medicine and psychiatry practice.
- Source used for verification: standard Russian ISI item set.
"""