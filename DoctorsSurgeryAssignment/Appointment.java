import java.io.Serializable;

public class Appointment implements Serializable {
    private static final long serialVersionUID = 1L;
    private Doctor doctor;
    private Patient patient;
    private String date;
    private String diagnosis;
    private String treatment;

    public Appointment(Doctor doctor, Patient patient, String date) {
        this.doctor = doctor;
        this.patient = patient;
        this.date = date;
        this.diagnosis = "Pending";
        this.treatment = "Pending";
    }
   
    public Doctor getDoctor() {
    return doctor;
    }

    public Patient getPatient() { return patient; }
    
    public void recordResult(String diagnosis, String treatment) {
        this.diagnosis = diagnosis;
        this.treatment = treatment;
    }

    @Override
    public String toString() {
        return "Date: " + date + " | Patient: " + patient.getName() + 
               " | Doctor: " + doctor.getName() + 
               "\n   -> Diagnosis: " + diagnosis + 
               "\n   -> Treatment: " + treatment;
    }
}