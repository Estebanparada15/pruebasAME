from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Permitir peticiones desde el frontend

# Conectar con MongoDB
client = MongoClient("mongodb+srv://jmarlonesteban:Millo$123@cluster0.e6v4b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['db1']
collection = db['empresas']

# Obtener todas las empresas
@app.route('/empresas', methods=['GET'])
def obtener_empresas():
    empresas = list(collection.find({}, {"_id": 0}))  # Excluye el campo _id de MongoDB
    return jsonify(empresas)

# Agregar una nueva empresa
@app.route('/empresas', methods=['POST'])
def agregar_empresa():
    data = request.json
    collection.insert_one(data)
    return jsonify({"mensaje": "Empresa agregada"}), 201

@app.route("/empresas/<nombre>", methods=["DELETE"])
def eliminar_empresa(nombre):
    result = collection.delete_one({"nombre": nombre})
    
    if result.deleted_count > 0:
        return jsonify({"mensaje": "Empresa eliminada correctamente"}), 200
    else:
        return jsonify({"error": "Empresa no encontrada"}), 404


if __name__ == '__main__':
    app.run(debug=True)