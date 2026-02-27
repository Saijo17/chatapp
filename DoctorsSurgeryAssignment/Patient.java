import java.io.Serializable;

public class Patient implements Serializable {
    private static final long serialVersionUID = 1L;
    private String patientID;
    private String name;

    public Patient(String patientID, String name) {
        this.patientID = patientID;
        this.name = name;
    }

    public String getPatientID() { return patientID; }
    public String getName() { return name; }

    @Override
    public String toString() {
        return "ID: " + patientID + " | Patient: " + name;
    }
}