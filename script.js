'use strict';

// prettier-ignore


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class Workout{
    date=new Date();
    id=(Date.now()+ '').slice(-10);
    clicks=0;
    constructor(coords,distance,duration){
        this.coords=coords;
        this.distance=distance;
        this.duration=duration;
        
    }
    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.description=`${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`

        //console.log(this.description)
    }
    click(){
        this.clicks++;
    }
    
}
class Running extends Workout{
    type='running'
    constructor(coords,distance,duration,cadence){
        super(coords,distance,duration)
        this.cadence=cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace(){
        this.pace=this.distance/(this.duration/60)
        return this.pace


    }
    

    
}
class Cycling extends Workout{
    type='cycling';
    constructor(coords,distance,duration,elevationGain){
        super(coords,distance,duration);
        this.elevationGain=elevationGain;
        this.calcSpeed();
        this._setDescription();

    }
    calcSpeed(){
        this.speed=this.distance/(this.duration/60)
        return this.speed
    }

}

const run1=new Running([23,-12],2.4,45,178);
const Cycle=new Cycling([34,-12],23,45,178);
run1.calcPace()
console.log(run1,Cycle)


class App{
    #map;
    #mapEvent;
    #workouts=[];
    #mapZoomLevel=13;
    
    
    constructor(){
        //Get user's position
        this._getPosition()
        //Get data from local storage
        this._getLocalStorage();
        //Event Handlers
        form.addEventListener('submit',this._newWorkout.bind(this));
        inputType.addEventListener('change',this._toggleElevationField);
        containerWorkouts.addEventListener('click',this._moveToPopup.bind(this));
    }
    _getPosition(){
        if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),function(){
            alert('Could not get your position:{')
        }
    );}
    _loadMap(position){
        const {latitude}=position.coords
        const {longitude}=position.coords
        
       // console.log(`https://www.google.pt/maps/@${latitude},${longitude},15z`)
        const coords=[latitude,longitude]
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
       // console.log(this)
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        //Handling Clicks on map
        this.#map.on('click',this._showForm.bind(this));
        this.#workouts.forEach(work=>{
            //this._renderWorkout(work);
             this._renderWorkoutMarker(work);
        })
    }
    _showForm(mapE){
            this.#mapEvent=mapE;
           //console.log(this.#mapEvent);
            form.classList.remove('hidden');
            inputDistance.focus();
    }
    _hideForm(){
        //Empty Input
        inputDistance.value=inputCadence.value=inputDuration.value=inputElevation.value='';
        form.style.display='none';
        form.classList.add('hidden');
        setTimeout(()=>form.style.display='grid',20)

    }
    _toggleElevationField(){
            
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    }
    _newWorkout(e){
        const validInput=(...inputs)=>inputs.every(inp=>Number.isFinite(inp));
        const allPositive=(...inputs)=>inputs.every(inp=>inp>0)
        e.preventDefault()
        
                //Clear input fields
                //Get data from form
                const type=inputType.value;
                const distance=+inputDistance.value;
                const duration=+inputDuration.value;
                const{lat,lng}=this.#mapEvent.latlng; 
                let workout;
                //Check if data is valid
                //If workout running, create running object
                if(type==='running'){
                    const cadence=+inputCadence.value
                    if(!validInput(distance,duration,cadence)|| !allPositive(distance,duration,cadence)) 
                    return alert('Inputs have to be positive number!')
                workout=new Running([lat,lng],distance,duration,cadence);
                }
                if(type==='cycling'){
                    const elevation=+inputElevation.value;
                    if(!validInput(distance,duration,elevation)|| !allPositive(distance,duration)) return alert('Inputs have to be positive number!')
                    workout=new Cycling([lat,lng],distance,duration,elevation);    
                }
                this.#workouts.push(workout);
                this._renderWorkoutMarker(workout)
                this._renderWorkout(workout)
                //console.log(this.#workouts)
                //If workout cycling,create cycling object
                //Add new object to workout array
                //Render workout on map as marker
               
                // console.log(this)
                // inputDistance.value=inputCadence.value=inputDuration.value=inputElevation.value=''
                this._hideForm()
                // console.log(this.#mapEvent)
                // const{lat,lng}=this.#mapEvent.latlng; 
                this._setLocalStorage();
              

    

}
_renderWorkoutMarker(workout){
    L.marker(workout.coords).addTo(this.#map)
    .bindPopup(L.popup({
     maxWidth:250,
     minWidth:100,
     autoClose:false,
     closeOnClick:false,
     className:`${workout.type}-popup`,
     })
     ).setPopupContent(`${workout.type==='running'?'🏃':'🚴'} ${workout.description}`).openPopup();
}
_renderWorkout(workout){
    let html=`<li class="workout workout--${workout.name}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type==='running'?'🏃':'🚴'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if(workout.type==='running'){
        html+=`<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`
    }
    if(workout.type==='cycling'){
        html+=`<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>`
    }
    form.insertAdjacentHTML('afterend',html)
}
_moveToPopup(e){
    if(!this.#map) return;
    const workoutEl=e.target.closest('.workout');
    // console.log(workoutEl);
    
   
    if(!workoutEl) return;
    const workout=this.#workouts.find(work=>work.id===workoutEl.dataset.id);
    // console.log(workout)
    this.#map.setView(workout.coords,this.#mapZoomLevel,{animate:true,
    pan:{
        duration: 1
    }});
    //workout.click();
    
}
_setLocalStorage(){
    localStorage.setItem('workouts',JSON.stringify(this.#workouts));
}

_getLocalStorage(){
    const data=JSON.parse(localStorage.getItem('workouts'));
    // console.log(data)
    if(!data) return;
    this.#workouts=data;
    this.#workouts.forEach(work=>{
        this._renderWorkout(work);
        // this._renderWorkoutMarker(work);
    })
}
reset(){
    localStorage.removeItem('workouts');
    location.reload();
}
}
const app=new App();
app._getPosition();

 

    
    

