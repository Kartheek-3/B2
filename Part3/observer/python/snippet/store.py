class ReminderStore:
    def __init__(self):
        self.tasks = []
        
    def add(self, task):
        self.tasks.append(task)
        
    def get_tasks(self):
        return self.tasks
        
    def cancel_for_appointment(self, appointment_id):
        self.tasks = [t for t in self.tasks if t['appointment_id'] != appointment_id]
