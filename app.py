import customtkinter as ctk
import database

ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")

class MOFApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("MOF - Medical Office Manager")
        self.geometry("900x600")

        # Τίτλος
        self.header_label = ctk.CTkLabel(
            self,
            text="MOF - Medical Office Manager",
            font=ctk.CTkFont(size=22, weight="bold")
        )
        self.header_label.pack(pady=15)

        # 1. Πλαίσιο Αναζήτησης (Search Frame)
        self.search_frame = ctk.CTkFrame(self)
        self.search_frame.pack(pady=10, padx=20, fill="x")

        # Πεδίο πληκτρολόγησης
        self.search_entry = ctk.CTkEntry(
            self.search_frame,
            placeholder_text="Αναζήτηση με Όνομα ή ΑΜΚΑ...",
            width=300
        )
        self.search_entry.pack(side="left", padx=10, pady=10)

        # Κουμπί Αναζήτησης
        self.search_btn = ctk.CTkButton(
            self.search_frame,
            text="Αναζήτηση",
            command=self.perform_search
        )
        self.search_btn.pack(side="left", padx=5, pady=10)

        # 2. Περιοχή εμφάνισης αποτελεσμάτων (προς το παρόν απλό κείμενο)
        self.results_textbox = ctk.CTkTextbox(self, width=850, height=350)
        self.results_textbox.pack(pady=15, padx=20)

    def perform_search(self):
        # Παίρνουμε το κείμενο που έγραψε ο χρήστης
        query = self.search_entry.get().strip()

        # Καλούμε τη συνάρτηση από το database.py
        patients = database.search_patient(query)

        # Καθαρίζουμε το πλαίσιο κειμένου πριν γράψουμε τα νέα αποτελέσματα
        self.results_textbox.delete("1.0", "end")

        if not patients:
            self.results_textbox.insert("end", "Δεν βρέθηκαν ασθενείς με αυτά τα στοιχεία.\n")
            return

        # Εμφανίζουμε κάθε ασθενή
        for p in patients:
            line = f"ID: {p['id']} | Όνομα: {p['full_name']} | ΑΜΚΑ: {p['amka']} | Τηλέφωνο: {p['phone']}\n"
            self.results_textbox.insert("end", line)

if __name__ == "__main__":
    database.init_db()
    app = MOFApp()
    app.mainloop()
