export interface IUpdateAnamnese {
    mainComplaintEvolution?: string;
    suffersFromDisease?: boolean;
    diseaseDescription?: string | null;
    underMedicalTreatment?: boolean;
    isPregnant?: boolean;
    usesMedication?: boolean;
    medicationDescription?: string | null;
    attendingPhysicianName?: string | null;
    attendingPhysicianPhone?: string | null;
    hasAllergies?: boolean;
    allergiesDescription?: string | null;
    hasHadSurgery?: boolean;
    surgeriesDescription?: string | null;
    healingProblems?: boolean;
    anesthesiaProblems?: boolean;
    hemorrhageProblems?: boolean;

    rheumaticFever?: boolean;
    heartProblems?: boolean;
    kidneyProblems?: boolean;
    gastricProblems?: boolean;
    respiratoryProblems?: boolean;
    allergicProblems?: boolean;
    jointRheumatismProblems?: boolean;
    diabetes?: boolean;
    arterialHypertension?: boolean;

    habits?: string | null;
    familyHistory?: string | null;
    otherInformation?: string | null;
}