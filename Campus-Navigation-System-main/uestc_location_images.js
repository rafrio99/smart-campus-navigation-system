const uestcLocationImages = {
  "South Gate 1": ["images/south_gate_1.jpg"],
  "South Gate 2": ["images/south_gate_2.jpg"],
  "West Gate 1": ["images/west_gate_1.jpg"],

  "Main Building A1": ["images/main_building_a1.jpg"],
  "Main Building B1": ["images/main_building_b1.jpg"],
  "Main Building B2": ["images/main_building_b2.jpg"],
  "Main Building B3": ["images/main_building_b3.jpg"],
  "Main Building C1": ["images/main_building_c1.jpg"],

  "Innovation Center": ["images/innovation_center.jpg"],
  "International Innovation Center": ["images/international_innovation_center.jpg"],

  "University Hospital": ["images/university_hospital.jpg"],
  "China Construction Bank": ["images/china_construction_bank.jpg"],
  "Xibei Cafeteria": ["images/xibei_cafeteria.jpg"],

  "Liren Teaching Building A": ["images/liren_teaching_building_a.jpg"],
  "Library": ["images/library_front.jpg", "images/library_left.jpg"],
  "Pinxue Teaching Building A": ["images/pinxue_teaching_building_a_water_flora.jpg"],

  "Research Building No. 4": ["images/research_building_no_4.jpg"],
  "Dormitory Building No. 2": ["images/dormitory_building_no_2.jpg"],
  "Gingko Avenue": ["images/gingko_avenue.jpg"],
  "Time Square": ["images/time_square.jpg"],

  "Building of School of Management and Economics (SME)": [
    "images/school_of_management_and_economics.jpg"
  ],

  "Basic Discipline Building": ["images/basic_discipline_building_water_flora.jpg"]
};

function getLocationImage(locationName) {
  if (
    typeof uestcLocationImages !== "undefined" &&
    uestcLocationImages[locationName] &&
    Array.isArray(uestcLocationImages[locationName]) &&
    uestcLocationImages[locationName].length > 0
  ) {
    return uestcLocationImages[locationName][0];
  }
  return "";
}