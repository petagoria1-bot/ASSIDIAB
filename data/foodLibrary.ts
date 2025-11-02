import { Food } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to calculate net carbs and round to nearest integer
const calculateNetCarbs = (total?: number, fiber?: number): number => {
    if (total === undefined || total === null) return 0;
    const net = total - (fiber || 0);
    return Math.round(net);
}

const foodEntries: Omit<Food, 'id' | 'carbs_per_100g_net'>[] = [
  // Boissons
  { name: 'Jus d\'orange (sans sucre ajouté)', category: 'Boissons', carbs_per_100g_total: 9.5, fiber_per_100g: 0.5, unit_type: 'ml', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 200, common_portion_name: 'Verre' },
  { name: 'Lait demi-écrémé', category: 'Boissons', carbs_per_100g_total: 4.8, fiber_per_100g: 0, unit_type: 'ml', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 200, common_portion_name: 'Verre' },
  { name: 'Lait au chocolat (boisson)', category: 'Boissons', carbs_per_100g_total: 11.2, fiber_per_100g: 0.5, unit_type: 'ml', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 200, common_portion_name: 'Bol' },
  { name: 'Soda (type Coca-Cola)', category: 'Boissons', carbs_per_100g_total: 10.6, fiber_per_100g: 0, unit_type: 'ml', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 330, common_portion_name: 'Canette' },
  
  // Féculents
  { name: 'Pain blanc (baguette)', category: 'Féculents', carbs_per_100g_total: 57.8, fiber_per_100g: 2.7, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 30, common_portion_name: 'Tranche' },
  { name: 'Pain complet', category: 'Féculents', carbs_per_100g_total: 48.3, fiber_per_100g: 6.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 30, common_portion_name: 'Tranche' },
  { name: 'Pain de mie', category: 'Féculents', carbs_per_100g_total: 50.1, fiber_per_100g: 3.6, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 25, common_portion_name: 'Tranche' },
  { name: 'Biscottes', category: 'Féculents', carbs_per_100g_total: 72, fiber_per_100g: 4.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 8, common_portion_name: 'Biscotte' },
  { name: 'Pâtes cuites', category: 'Féculents', carbs_per_100g_total: 28.5, fiber_per_100g: 2.1, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Assiette' },
  { name: 'Riz blanc cuit', category: 'Féculents', carbs_per_100g_total: 28, fiber_per_100g: 0.9, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Bol' },
  { name: 'Pomme de terre cuite', category: 'Féculents', carbs_per_100g_total: 18.2, fiber_per_100g: 1.8, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Moyenne' },
  { name: 'Purée de pommes de terre (maison)', category: 'Féculents', carbs_per_100g_total: 14.5, fiber_per_100g: 1.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 200, common_portion_name: 'Portion' },
  { name: 'Frites (four)', category: 'Féculents', carbs_per_100g_total: 35.5, fiber_per_100g: 3, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },
  { name: 'Lentilles cuites', category: 'Féculents', carbs_per_100g_total: 19.5, fiber_per_100g: 7.8, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Portion' },
  { name: 'Semoule (couscous) cuite', category: 'Féculents', carbs_per_100g_total: 24.2, fiber_per_100g: 1.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Portion' },

  // Fruits
  { name: 'Pomme', category: 'Fruits', carbs_per_100g_total: 12.1, fiber_per_100g: 2.4, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Moyenne' },
  { name: 'Banane', category: 'Fruits', carbs_per_100g_total: 20.5, fiber_per_100g: 2.6, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 120, common_portion_name: 'Moyenne' },
  { name: 'Orange', category: 'Fruits', carbs_per_100g_total: 9.2, fiber_per_100g: 2.4, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Moyenne' },
  { name: 'Fraises', category: 'Fruits', carbs_per_100g_total: 6.2, fiber_per_100g: 1.9, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },
  { name: 'Raisins', category: 'Fruits', carbs_per_100g_total: 16.1, fiber_per_100g: 1.4, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Grappe' },
  { name: 'Compote de pommes (sans sucre ajouté)', category: 'Fruits', carbs_per_100g_total: 11.5, fiber_per_100g: 1.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Pot' },
  
  // Légumes
  { name: 'Tomate', category: 'Légumes', carbs_per_100g_total: 2.8, fiber_per_100g: 1.2, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 120, common_portion_name: 'Moyenne' },
  { name: 'Carottes râpées', category: 'Légumes', carbs_per_100g_total: 7.6, fiber_per_100g: 2.9, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },
  { name: 'Courgette cuite', category: 'Légumes', carbs_per_100g_total: 3.1, fiber_per_100g: 1.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Portion' },
  { name: 'Haricots verts cuits', category: 'Légumes', carbs_per_100g_total: 5.2, fiber_per_100g: 3.3, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Portion' },
  { name: 'Petits pois cuits', category: 'Légumes', carbs_per_100g_total: 10.5, fiber_per_100g: 5.2, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },
  { name: 'Maïs en conserve', category: 'Légumes', carbs_per_100g_total: 17.5, fiber_per_100g: 3.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },

  // Laitages
  { name: 'Yaourt nature', category: 'Laitages', carbs_per_100g_total: 5.3, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 125, common_portion_name: 'Pot' },
  { name: 'Yaourt aux fruits', category: 'Laitages', carbs_per_100g_total: 14.2, fiber_per_100g: 0.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 125, common_portion_name: 'Pot' },
  { name: 'Fromage blanc 20%', category: 'Laitages', carbs_per_100g_total: 3.8, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },
  { name: 'Petit suisse', category: 'Laitages', carbs_per_100g_total: 3.5, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 60, common_portion_name: 'Pot' },

  // Plats
  { name: 'Pizza (reine)', category: 'Plats', carbs_per_100g_total: 25.4, fiber_per_100g: 2, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Part' },
  { name: 'Lasagnes', category: 'Plats', carbs_per_100g_total: 14.1, fiber_per_100g: 1.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 250, common_portion_name: 'Part' },
  { name: 'Quiche Lorraine', category: 'Plats', carbs_per_100g_total: 13.5, fiber_per_100g: 1, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 150, common_portion_name: 'Part' },
  
  // Sucré
  { name: 'Chocolat au lait (tablette)', category: 'Sucré', carbs_per_100g_total: 58.3, fiber_per_100g: 2.2, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 20, common_portion_name: '2 carrés' },
  { name: 'Chocolat noir 70%', category: 'Sucré', carbs_per_100g_total: 35.4, fiber_per_100g: 10.7, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 20, common_portion_name: '2 carrés' },
  { name: 'Biscuit sec (Petit Beurre)', category: 'Sucré', carbs_per_100g_total: 73.6, fiber_per_100g: 2.8, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 8, common_portion_name: 'Biscuit' },
  { name: 'Madeleine', category: 'Sucré', carbs_per_100g_total: 55.1, fiber_per_100g: 1.5, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 25, common_portion_name: 'Pièce' },
  { name: 'Miel', category: 'Sucré', carbs_per_100g_total: 80.5, fiber_per_100g: 0.2, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 20, common_portion_name: 'Cuillère' },
  { name: 'Confiture', category: 'Sucré', carbs_per_100g_total: 60, fiber_per_100g: 1, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 20, common_portion_name: 'Cuillère' },

  // Viandes & Poissons
  { name: 'Steak haché cuit', category: 'Viandes', carbs_per_100g_total: 0, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 100, common_portion_name: 'Portion' },
  { name: 'Blanc de poulet cuit', category: 'Viandes', carbs_per_100g_total: 0, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 120, common_portion_name: 'Portion' },
  { name: 'Jambon blanc', category: 'Viandes', carbs_per_100g_total: 1, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 40, common_portion_name: 'Tranche' },
  { name: 'Filet de saumon cuit', category: 'Poissons', carbs_per_100g_total: 0, fiber_per_100g: 0, unit_type: 'g', source: 'CIQUAL_based', quality: 'certaine', common_portion_g: 120, common_portion_name: 'Portion' },
];

export const initialFoodData: Food[] = foodEntries.map(food => ({
    ...food,
    id: uuidv4(),
    carbs_per_100g_net: calculateNetCarbs(food.carbs_per_100g_total, food.fiber_per_100g)
}));
