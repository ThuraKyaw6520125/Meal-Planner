'use client';

import { useState, useEffect } from 'react';

export default function MealPlanner() {
    const [userData, setUserData] = useState({
        weight: '',
        height: '',
        age: '',
        gender: 'male',
        activityLevel: '1',
        goal: 'maintain',
    });
    const [mealPlan, setMealPlan] = useState(null);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const calculateBmi = (weight, height) => weight / (height * height);

    const calculateBmr = (weight, height, age, gender) => {
        if (gender === 'male') {
            return 88.362 + (13.397 * weight) + (4.799 * height * 100) - (5.677 * age);
        }
        return 447.593 + (9.247 * weight) + (3.098 * height * 100) - (4.33 * age);
    };

    const calculateDnc = (bmr, activityLevel) => {
        const activityMultiplier = {
            '1': 1.2,
            '2': 1.375,
            '3': 1.55,
            '4': 1.725,
            '5': 1.9,
        };
        return bmr * activityMultiplier[activityLevel];
    };

    const fetchMealPlan = async () => {
        const { weight, height, age, gender, activityLevel, goal } = userData;
        if (!weight || !height || !age) {
            alert('Please fill in all fields');
            return;
        }

        const bmi = calculateBmi(parseFloat(weight), parseFloat(height));
        const bmr = calculateBmr(parseFloat(weight), parseFloat(height), parseInt(age), gender);
        const dnc = calculateDnc(bmr, activityLevel);
        
        let dncsat;
        if (goal === 'gain') {
            dncsat = dnc + 500;
        } else if (goal === 'loss') {
            dncsat = dnc - 500;
        } else {
            dncsat = dnc;
        }

        try {
            const response = await fetch('/food.json');
            if (!response.ok) throw new Error('Failed to fetch meal data');
            const foodData = await response.json();

            const getRandomMeal = (category) => {
                return foodData[category][Math.floor(Math.random() * foodData[category].length)];
            };

            let breakfast = [getRandomMeal('breakfast')];
            let lunch = [getRandomMeal('lunch')];
            let dinner = [getRandomMeal('dinner')];

            let totalCalories = breakfast[0].Calories + lunch[0].Calories + dinner[0].Calories;
            
            while (totalCalories < dncsat - 100) {
                const mealType = Math.random() < 0.33 ? 'breakfast' : Math.random() < 0.5 ? 'lunch' : 'dinner';
                const extraMeal = getRandomMeal(mealType);
                
                if (totalCalories + extraMeal.Calories <= dncsat) {
                    if (mealType === 'breakfast') {
                        breakfast.push(extraMeal);
                    } else if (mealType === 'lunch') {
                        lunch.push(extraMeal);
                    } else {
                        dinner.push(extraMeal);
                    }
                    totalCalories += extraMeal.Calories;
                }
            }

            setMealPlan({
                bmi: bmi.toFixed(2),
                bmr: bmr.toFixed(2),
                dnc: dnc.toFixed(2),
                dncsat: dncsat.toFixed(2),
                breakfast,
                lunch,
                dinner,
            });
        } catch (error) {
            console.error('Error fetching meal plan:', error);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h1 className="text-xl font-bold mb-4">Meal Planner</h1>
            <div className="space-y-2 text-black">
                <input name="weight" type="number" placeholder="Weight (kg)" className="w-full p-2 border rounded text-black" onChange={handleChange} />
                <input name="height" type="number" placeholder="Height (m)" className="w-full p-2 border rounded text-black" onChange={handleChange} />
                <input name="age" type="number" placeholder="Age" className="w-full p-2 border rounded text-black" onChange={handleChange} />
                <select name="gender" className="w-full p-2 border rounded text-black" onChange={handleChange}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <select name="activityLevel" className="w-full p-2 border rounded text-black" onChange={handleChange}>
                    <option value="1">Sedentary</option>
                    <option value="2">Lightly Active</option>
                    <option value="3">Moderately Active</option>
                    <option value="4">Very Active</option>
                    <option value="5">Super Active</option>
                </select>
                <select name="goal" className="w-full p-2 border rounded text-black" onChange={handleChange}>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                    <option value="loss">Lose Weight</option>
                </select>
                <button className="w-full bg-blue-500 text-white p-2 rounded" onClick={fetchMealPlan}>Generate Meal Plan</button>
            </div>
            {mealPlan && (
                <div className="mt-6 p-4 border rounded">
                    <h2 className="text-lg font-bold">Meal Plan</h2>
                    <p><strong>BMI:</strong> {mealPlan.bmi}</p>
                    <p><strong>BMR:</strong> {mealPlan.bmr}</p>
                    <p><strong>Daily Calorie Needs:</strong> {mealPlan.dnc}</p>
                    <p><strong>Adjusted Calories:</strong> {mealPlan.dncsat}</p>
                    <h3 className="font-bold mt-2">Breakfast</h3>
                    {mealPlan.breakfast.map((meal, index) => (
                        <p key={index}>{meal.Display_Name} - {meal.Calories} cal</p>
                    ))}
                    <h3 className="font-bold mt-2">Lunch</h3>
                    {mealPlan.lunch.map((meal, index) => (
                        <p key={index}>{meal.Display_Name} - {meal.Calories} cal</p>
                    ))}
                    <h3 className="font-bold mt-2">Dinner</h3>
                    {mealPlan.dinner.map((meal, index) => (
                        <p key={index}>{meal.Display_Name} - {meal.Calories} cal</p>
                    ))}
                </div>
            )}
        </div>
    );
}
