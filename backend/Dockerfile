# Usa la imagen base de Node.js
FROM python:3.12.3

# Establece el directorio de trabajo
WORKDIR /root/cloud_sec_proy_1/backend/blogapi

# Copia los archivos de dependencias
COPY requirements.txt ./

# Instala las dependencias
RUN pip install --no-cache-dir -r requirements.txt

RUN pip install google-cloud-secret-manager

RUN pip install python-dotenv

WORKDIR /root/cloud_sec_proy_1/backend/blogapi

# Copia el resto del código
COPY . .

# Expone el puerto
EXPOSE 8000

# Comando de inicio
CMD ["uvicorn", "blogapi.main:app", "--host", "0.0.0.0", "--port", "8000"]
