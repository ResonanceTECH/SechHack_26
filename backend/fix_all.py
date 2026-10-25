import re, glob
for path in glob.glob('app/services/*.py'):
    s=open(path,encoding='utf-8').read()
    # import replacement (only standalone function, not _practitioner_clinic_id)
    s=s.replace('from app.services.clinic_isolation import practitioner_clinic_id,',
                'from app.services.clinic_isolation import practitioner_clinic_ids,')
    s=s.replace('from app.services.clinic_isolation import practitioner_clinic_id\n',
                'from app.services.clinic_isolation import practitioner_clinic_ids\n')
    # generic variable replacements for direct calls
    s=s.replace('p_clinic = await practitioner_clinic_id(db, current_user)',
                'p_clinics = await practitioner_clinic_ids(db, current_user)\np_clinic = p_clinics[0] if p_clinics else None')
    open(path,'w',encoding='utf-8').write(s)
print('done')