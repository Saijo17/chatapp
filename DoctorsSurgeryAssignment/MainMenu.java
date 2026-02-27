import java.util.Scanner;
import java.util.ArrayList;
import java.io.*;

public class MainMenu {
    private ArrayList<Doctor> doctors = new ArrayList<>();
    private ArrayList<Patient> patients = new ArrayList<>();
    private ArrayList<Appointment> appointments = new ArrayList<>();
    private Scanner scanner = new Scanner(System.in);
    private final String FILE_NAME = "surgery_data.dat";

    public static void main(String[] args) {
        MainMenu mySurgery = new MainMenu();
        mySurgery.run();
    }

    public void run() {
    loadData(); // Restore permanent records on startup 
    boolean quit = false;
    while (!quit) {
        System.out.println("\n--- Doctors' Surgery Main Menu ---");
        System.out.println("1. Add Doctor");
        System.out.println("2. Register Patient");
        System.out.println("3. Schedule Appointment");
        System.out.println("4. Record Diagnosis & Treatment"); 
        System.out.println("5. Display Reports");
        System.out.println("6. Delete Menu"); 
        System.out.println("7. Save and Exit");
        System.out.print("Select: ");

        String choice = scanner.nextLine();
        switch (choice) {
            case "1": addDoctor(); break;
            case "2": addPatient(); break;
            case "3": makeAppointment(); break;
            case "4": recordMedicalResult(); break;
            case "5": displayAll(); break;
            case "6": deleteMenu(); break; 
            case "7": saveData(); quit = true; break;
            default: System.out.println("Invalid option.");
        }
    }
}

   private void addDoctor() {
    
    System.out.println("\n--- Adding New Doctor ---");
    System.out.print("Enter ID: ");
    String id = scanner.nextLine();
    System.out.print("Enter Name: ");
    String name = scanner.nextLine();
    System.out.print("Enter Specialization: ");
    String spec = scanner.nextLine();
    

    doctors.add(new Doctor(id, name, spec));
    System.out.println("\n[SUCCESS]: Doctor 'Dr. " + name + "' added to the system.");
    System.out.println("Total Doctors now: " + doctors.size());
    
}

    private void addPatient() {
        System.out.print("ID: "); String id = scanner.nextLine();
        System.out.print("Name: "); String name = scanner.nextLine();
        patients.add(new Patient(id, name));
        System.out.println("[NOTIFY]: Patient registered.");
    }

    private void makeAppointment() {
    String date = getValidDate(); 

    // 2. Ask for IDs
    System.out.print("Patient ID: "); 
    String pID = scanner.nextLine();
    System.out.print("Doctor ID: "); 
    String dID = scanner.nextLine();

    // 3. Search for the objects
    Patient p = findPatient(pID);
    Doctor d = findDoctor(dID);

    // 4. Final check for IDs
    if (p != null && d != null) {
        appointments.add(new Appointment(d, p, date));
        System.out.println("[NOTIFICATION]: Change detected. Appointment created.");
    } else {
        System.out.println("[ERROR]: IDs not found. No appointment scheduled.");
    }
}
    private void recordMedicalResult() {
        System.out.print("Patient ID for appointment: ");
        String pID = scanner.nextLine();
        for (Appointment a : appointments) {
            if (a.getPatient().getPatientID().equals(pID)) {
                System.out.print("Diagnosis: "); String diag = scanner.nextLine();
                System.out.print("Treatment: "); String treat = scanner.nextLine();
                a.recordResult(diag, treat);
                System.out.println("[NOTIFY]: Record updated.");
                return;
            }
        }
        System.out.println("[ERROR]: No appointment found.");
    }
    private void deleteMenu() {
    System.out.println("\n--- Delete Records ---");
    System.out.println("1. Delete a Doctor");
    System.out.println("2. Delete a Patient");
    System.out.println("3. Delete an Appointment");
    System.out.println("4. Back to Main Menu");
    System.out.print("Select: ");
    
    String choice = scanner.nextLine();
    switch (choice) {
        case "1": deleteDoctor(); break;
        case "2": deletePatient(); break;
        case "3": deleteAppointment(); break;
        case "4": return;
        default: System.out.println("Invalid choice.");
    }
}

private void deleteDoctor() {
    System.out.print("Enter Doctor ID to delete: ");
    String id = scanner.nextLine();
    
    // 1. Remove the doctor
    boolean removed = doctors.removeIf(d -> d.getDoctorID().equals(id));
    
    if (removed) {
        // 2. Automatically remove all appointments linked to this doctor
        appointments.removeIf(a -> a.getDoctor().getDoctorID().equals(id));
        System.out.println("[NOTIFICATION]: Doctor and all their scheduled appointments have been removed.");
    } else {
        System.out.println("[ERROR]: Doctor ID not found.");
    }
}

private void deletePatient() {
    System.out.print("Enter Patient ID to delete: ");
    String id = scanner.nextLine();
    boolean removed = patients.removeIf(p -> p.getPatientID().equals(id));
    if (removed) {
        // Also remove their appointments to keep data consistent
        appointments.removeIf(a -> a.getPatient().getPatientID().equals(id));
        System.out.println("[NOTIFICATION]: Patient and their appointments removed.");
    } else {
        System.out.println("[ERROR]: Patient ID not found.");
    }
}

private void deleteAppointment() {
    System.out.print("Enter Patient ID for the appointment to delete: ");
    String id = scanner.nextLine();
    boolean removed = appointments.removeIf(a -> a.getPatient().getPatientID().equals(id));
    if (removed) {
        System.out.println("[NOTIFICATION]: Appointment deleted.");
    } else {
        System.out.println("[ERROR]: No appointment found for that Patient.");
    }
}

    private void displayAll() {
        System.out.println("\n--- DOCTORS ---");
        for (Doctor d : doctors) System.out.println(d);
        System.out.println("\n--- PATIENTS ---");
        for (Patient p : patients) System.out.println(p);
        System.out.println("\n--- APPOINTMENTS & TREATMENT REPORTS ---");
        for (Appointment a : appointments) System.out.println(a);
    }

    private void saveData() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE_NAME))) {
            oos.writeObject(doctors);
            oos.writeObject(patients);
            oos.writeObject(appointments);
            System.out.println("[NOTIFY]: Records saved to disk.");
        } catch (IOException e) { System.out.println("Save failed."); }
    }

   private void loadData() {
    File f = new File(FILE_NAME);
    if (!f.exists()) {
        System.out.println("[SYSTEM]: No previous records found. Starting with a fresh database.");
        return; 
    }
    try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(f))) {
        doctors = (ArrayList<Doctor>) ois.readObject();
        patients = (ArrayList<Patient>) ois.readObject();
        appointments = (ArrayList<Appointment>) ois.readObject();
        System.out.println("[SUCCESS]: " + (doctors.size() + patients.size()) + " records loaded from storage.");
    } catch (Exception e) {
        System.out.println("[ERROR]: Could not load data. The file might be corrupted.");
    }
}

    private Patient findPatient(String id) {
        for (Patient p : patients) if (p.getPatientID().equals(id)) return p;
        return null;
    }

    private Doctor findDoctor(String id) {
        for (Doctor d : doctors) if (d.getDoctorID().equals(id)) return d;
        return null;
    }

private String getValidName(String prompt) {
    String name;
    while (true) {
        System.out.print(prompt);
        name = scanner.nextLine();
        // Validation: Ensures only letters and spaces are used 
        if (name.matches("^[a-zA-Z\\s]+$") && !name.trim().isEmpty()) {
            return name;
        } else {
            System.out.println("[ERROR]: Invalid name. Use letters only.");
        }
    }
}

private String getValidDate() {
    while (true) {
        System.out.print("Enter Date (YYYY-MM-DD): ");
        String dateInput = scanner.nextLine();
        try {
            java.time.LocalDate inputDate = java.time.LocalDate.parse(dateInput);
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDate maxDate = today.plusYears(1); // Fixed 1-year period

            if (inputDate.isBefore(today)) {
                System.out.println("[ERROR]: Date cannot be in the past.");
            } else if (inputDate.isAfter(maxDate)) {
                System.out.println("[ERROR]: Limit is 1 year in advance.");
            } else {
                return dateInput; // Successfully validated
            }
        } catch (java.time.format.DateTimeParseException e) {
            System.out.println("[ERROR]: Use format YYYY-MM-DD (e.g., 2026-04-01).");
        }
    }
}
}