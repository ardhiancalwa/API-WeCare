import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from typing import List, Dict
import json
import requests

load_dotenv()

class HospitalChatbot:
    def __init__(self):
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError("GOOGLE_API_KEY tidak ditemukan di environment variables")
        
        self.llm = ChatGoogleGenerativeAI(
            google_api_key=api_key,
            model="gemini-2.5-flash-preview-04-17",  # Ganti dari gemini-pro ke yang tersedia publik
            temperature=0.7
        )
        
    def create_hospital_prompt(self, main_complaint: str, examinations: List[str], hospitals: List[Dict], category: str = "terdekat") -> str:
        prompt = PromptTemplate(
            input_variables=["main_complaint", "examinations", "hospitals", "category"],
            template="""
            Based on the following information:
            
            Main Complaint: {main_complaint}
            Desired Examinations: {examinations}
            Hospital Category: {category}
            
            Analyze these hospitals and recommend the best options:
            {hospitals}
            
            Please provide:
            1. Analysis of the main complaint and required examinations
            2. Top 3 hospital recommendations based on the category
            3. Reasoning for each recommendation
            4. Additional health tips related to the complaint
            
            Format the response in JSON with the following structure:
            {{
                "analysis": "string",
                "recommendations": [
                    {{
                        "hospital_id": "number",
                        "hospital_name": "string",
                        "reason": "string",
                        "estimated_cost": "string",
                        "services_offered": ["string"]
                    }}
                ],
                "health_tips": ["string"]
            }}
            """
        )
        return prompt.format(
            main_complaint=main_complaint,
            examinations=", ".join(examinations),
            hospitals=json.dumps(hospitals, indent=2),
            category=category
        )

    def filter_hospitals(self, hospitals: List[Dict], category: str, user_location: Dict = None) -> List[Dict]:
        if category == "terdekat":
            if user_location:
                return sorted(
                    hospitals,
                    key=lambda x: (
                        x["provinsi"] == user_location["provinsi"],
                        x["kota"] == user_location["kota"],
                        x["kecamatan"] == user_location["kecamatan"]
                    ),
                    reverse=True
                )
            return hospitals
        elif category == "biaya_termurah":
            return sorted(hospitals, key=lambda x: x.get("estimated_cost", float("inf")))
        elif category == "pelayanan_terbanyak":
            return sorted(hospitals, key=lambda x: len(x.get("services", [])), reverse=True)
        return hospitals

    def get_hospital_recommendations(self, main_complaint: str, examinations: List[str], 
                                   hospitals: List[Dict], category: str = "terdekat",
                                   user_location: Dict = None) -> Dict:
        filtered_hospitals = self.filter_hospitals(hospitals, category, user_location)
        prompt = self.create_hospital_prompt(main_complaint, examinations, filtered_hospitals, category)
        
        try:
            response = self.llm.invoke(prompt)
            response_text = response.content if hasattr(response, "content") else str(response)

            # Bersihkan markdown wrapper (```)
            if response_text.strip().startswith("```json"):
                response_text = response_text.strip().removeprefix("```json").removesuffix("```").strip()
            elif response_text.strip().startswith("```"):
                response_text = response_text.strip().removeprefix("```").removesuffix("```").strip()

            # Parse JSON yang sudah dibersihkan
            return json.loads(response_text)

        except json.JSONDecodeError:
            return {
                "error": "Response dari LLM tidak dapat diubah menjadi JSON.",
                "raw_response": response_text
            }
        except Exception as e:
            return {
                "error": f"Gagal memanggil LLM: {str(e)}"
            }

def main():
    chatbot = HospitalChatbot()

    print("📢 Selamat datang di HospitalChatbot 👩‍⚕️🧑‍⚕️")
    print("Ketik 'exit' kapan saja untuk keluar.\n")

    while True:
        main_complaint = input("🩺 Keluhan utama pasien: ")
        if main_complaint.lower() == "exit":
            print("👋 Sampai jumpa! Semoga sehat selalu~")
            break

        examinations = []
        for i in range(3):
            exam = input(f"🔍 Pemeriksaan {i+1} (kosongkan jika cukup): ")
            if exam.lower() == "exit":
                print("👋 Sampai jumpa! Semoga sehat selalu~")
                return
            if not exam:
                break
            examinations.append(exam)

        hospitals_data = fetch_hospitals_from_api()
        if not hospitals_data:
            print("⚠️ Gagal mendapatkan data RS. Silakan coba lagi nanti.")
            continue

        user_location = {
            "provinsi": "DKI Jakarta",
            "kota": "Jakarta Selatan",
            "kecamatan": "Kebayoran Baru"
        }

        recommendations = chatbot.get_hospital_recommendations(
            main_complaint=main_complaint,
            examinations=examinations,
            hospitals=hospitals_data,
            category="terdekat",
            user_location=user_location
        )

        print("\n🤖 Rekomendasi Rumah Sakit:")
        print(json.dumps(recommendations, indent=2, ensure_ascii=False))
        print("\n---\n")
  
def fetch_hospitals_from_api() -> List[Dict]:
    try:
        response = requests.get("https://api-we-care.vercel.app/api/hospitals")
        response.raise_for_status()
        data = response.json()
        return data.get("data", {}).get("data", [])  # sesuai struktur JSON API kamu
    except Exception as e:
        print(f"❌ Gagal ambil data dari API: {str(e)}")
        return []
if __name__ == "__main__":
    main()
