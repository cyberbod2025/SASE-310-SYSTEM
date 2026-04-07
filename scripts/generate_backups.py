
import json
import csv
import os

# Path to the JSON data retrieved from Supabase
data_path = r"C:\Users\cyber\.gemini\antigravity\brain\fbe6d1f6-3727-4c9b-9afe-f35b438c3137\.system_generated\steps\87\output.txt"
output_dir = r"c:\Users\cyber\Desktop\sase-310_-sistema-escolar\backups\data_alumnos"

def generate_csvs():
    with open(data_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Find the JSON part between <untrusted-data-...> tags
        start_tag = "<untrusted-data-59a0d015-970f-46e6-8ed4-582a5b697b0e>"
        end_tag = "</untrusted-data-59a0d015-970f-46e6-8ed4-582a5b697b0e>"
        
        try:
            json_str = content.split(start_tag)[1].split(end_tag)[0].strip()
            students = json.loads(json_str)
        except Exception as e:
            print(f"Error parsing JSON: {e}")
            return

    # 1. Master CSV
    master_path = os.path.join(output_dir, "LISTA_MAESTRA_SASE_2026.csv")
    keys = ["nombre_completo", "curp", "grado", "grupo", "matricula"]
    
    with open(master_path, 'w', newline='', encoding='utf-8-sig') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(students)
    
    print(f"Master CSV created: {master_path}")

    # 2. CSVs by Group
    groups = {}
    for student in students:
        group_name = student.get("grupo", "SIN_GRUPO")
        if not group_name: group_name = "SIN_GRUPO"
        # Sanitize group name for filename
        safe_name = group_name.replace("º", "").replace(" ", "_")
        if safe_name not in groups:
            groups[safe_name] = []
        groups[safe_name].append(student)

    for group, rows in groups.items():
        group_path = os.path.join(output_dir, f"ALUMNOS_{group}.csv")
        with open(group_path, 'w', newline='', encoding='utf-8-sig') as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(rows)
        print(f"Group CSV created: {group_path}")

if __name__ == "__main__":
    generate_csvs()
