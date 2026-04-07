
import json
import csv
import os

# The data is now available in the script via a variable
students_json = """
[{"nombre_completo":"ABURTO TORRES JESUS ANTONIO","curp":null,"grado":null,"grupo":"1º A","matricula":"250001"},{"nombre_completo":"ACOSTA TORRES FERNANDO","curp":null,"grado":null,"grupo":"1º A","matricula":"250002"},{"nombre_completo":"ALONSO MARTINEZ CARMEN MONSERRAT","curp":null,"grado":null,"grupo":"1º A","matricula":"250003"},{"nombre_completo":"ALVARADO VILLALOBOS CAMILA","curp":null,"grado":null,"grupo":"1º A","matricula":"250004"},{"nombre_completo":"ALVAREZ GALINDO ANTONELLA GUADALUPE","curp":null,"grado":null,"grupo":"1º A","matricula":"250005"},{"nombre_completo":"AVENDANO NAVA CESAR","curp":null,"grado":null,"grupo":"1º A","matricula":"250006"},{"nombre_completo":"BAUTISTA CORZO ALDAHIR ANTONIO","curp":null,"grado":null,"grupo":"1º A","matricula":"250007"},{"nombre_completo":"CABELLO CERON CRISTINA MARIEL","curp":null,"grado":null,"grupo":"1º A","matricula":"250008"},{"nombre_completo":"CANO SANCHEZ ANGEL OMAR","curp":null,"grado":null,"grupo":"1º A","matricula":"250009"},{"nombre_completo":"CARO REFUGIO ROQUE FERNANDO","curp":null,"grado":null,"grupo":"1º A","matricula":"250010"},{"nombre_completo":"DIAZ PAIZ JONATHAN","curp":null,"grado":null,"grupo":"1º A","matricula":"250011"},{"nombre_completo":"GARCIA GOMEZ SANTIAGO GAEL","curp":null,"grado":null,"grupo":"1º A","matricula":"250012"},{"nombre_completo":"GARCIA GONZALEZ SANTIAGO ISAI","curp":null,"grado":null,"grupo":"1º A","matricula":"250013"},{"nombre_completo":"GOMEZ CRUZ IAN ALEJANDRO","curp":null,"grado":null,"grupo":"1º A","matricula":"250014"},{"nombre_completo":"GUZMAN GOMEZ SUSANA","curp":null,"grado":null,"grupo":"1º A","matricula":"250015"},{"nombre_completo":"HERNANDEZ FERNANDEZ SANTIAGO","curp":null,"grado":null,"grupo":"1º A","matricula":"250016"},{"nombre_completo":"HERNANDEZ GUTIERREZ BRAYAN GAEL","curp":null,"grado":null,"grupo":"1º A","matricula":"250017"},{"nombre_completo":"HERNANDEZ MARINEZ ANET CAMILA","curp":null,"grado":null,"grupo":"1º A","matricula":"250018"},{"nombre_completo":"LEON JULIO GIOVANNI SANTIAGO","curp":null,"grado":null,"grupo":"1º A","matricula":"250019"},{"nombre_completo":"LIMA CONCHA ALISON YOHANI","curp":null,"grado":null,"grupo":"1º A","matricula":"250020"},{"nombre_completo":"LOPEZ LOPEZ EDUARDO","curp":null,"grado":null,"grupo":"1º A","matricula":"250021"},{"nombre_completo":"MARIN GARCIA ELAY CANEK","curp":null,"grado":null,"grupo":"1º A","matricula":"250022"},{"nombre_completo":"MARTINEZ HERNANDEZ NIKKI SAYUMI","curp":null,"grado":null,"grupo":"1º A","matricula":"250023"},{"nombre_completo":"MENDOZA VARGAS MELANY JUDITH","curp":null,"grado":null,"grupo":"1º A","matricula":"250024"},{"nombre_completo":"MERINO CARMONA SANTIAGO ALEXANDER","curp":null,"grado":null,"grupo":"1º A","matricula":"250025"},{"nombre_completo":"MORALES GARCIA VANESSA","curp":null,"grado":null,"grupo":"1º A","matricula":"250026"},{"nombre_completo":"NAVA PEÑA HORUS KENSHIN","curp":null,"grado":null,"grupo":"1º A","matricula":"250027"},{"nombre_completo":"OSORIO REYES JAMY SAMANTHA","curp":null,"grado":null,"grupo":"1º A","matricula":"250028"},{"nombre_completo":"SANCHEZ GARCIA CRISTIAN SALVADOR","curp":null,"grado":null,"grupo":"1º A","matricula":"250029"},{"nombre_completo":"SANDOVAL MARIN NATALY","curp":null,"grado":null,"grupo":"1º A","matricula":"250030"},{"nombre_completo":"SANTIAGO HERNANDEZ RENATA","curp":null,"grado":null,"grupo":"1º A","matricula":"250031"},{"nombre_completo":"SANTOS MORENO ADAN SANTIAGO","curp":null,"grado":null,"grupo":"1º A","matricula":"250032"},{"nombre_completo":"SARABIA CARRILLO KIMBERLY ALIN","curp":null,"grado":null,"grupo":"1º A","matricula":"250033"},{"nombre_completo":"SATURNO CRUZ MAURICIO ALAIN","curp":null,"grado":null,"grupo":"1º A","matricula":"250034"},{"nombre_completo":"SUAREZ HERNANDEZ KEVIN ALEJANDRO","curp":null,"grado":null,"grupo":"1º A","matricula":"250035"},{"nombre_completo":"URBANO ELIZALDE MAXIMO ALEXANDER","curp":null,"grado":null,"grupo":"1º A","matricula":"250036"},{"nombre_completo":"VALIENTE RODRIGUEZ CHRISTOPHER IVAN","curp":null,"grado":null,"grupo":"1º A","matricula":"250037"},{"nombre_completo":"VAZQUEZ GUTIERREZ DAVID ELI","curp":null,"grado":null,"grupo":"1º A","matricula":"250038"},{"nombre_completo":"VEGA VAZQUEZ VANESA RUTH","curp":null,"grado":null,"grupo":"1º A","matricula":"250039"},{"nombre_completo":"VELASCO GARDUÑO ANGEL ISAAC","curp":null,"grado":null,"grupo":"1º A","matricula":"250040"},{"nombre_completo":"VICENCIO ALVARADO JUAN OMAR","curp":null,"grado":null,"grupo":"1º A","matricula":"250041"},{"nombre_completo":"VILLANUEVA PACHECO XIMENA DANAE","curp":null,"grado":null,"grupo":"1º A","matricula":"250042"}]
"""

output_dir = r"c:\Users\cyber\Desktop\sase-310_-sistema-escolar\backups\data_alumnos"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

def generate_csvs():
    students = json.loads(students_json)
    master_path = os.path.join(output_dir, "LISTA_ALUMNOS_PARCIAL.csv")
    keys = ["nombre_completo", "curp", "grado", "grupo", "matricula"]
    
    with open(master_path, 'w', newline='', encoding='utf-8-sig') as output_file:
        dict_writer = csv.DictWriter(output_file, fieldnames=keys)
        dict_writer.writeheader()
        dict_writer.writerows(students)
    
    print(f"CSV created: {master_path}")

if __name__ == "__main__":
    generate_csvs()
