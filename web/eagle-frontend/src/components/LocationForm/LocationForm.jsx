import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import './LocationForm.css';
import axios from 'axios';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Map from "../Map/Map";
import Cookies from 'js-cookie';
import {useAuth} from "../../contexts/AuthContext.jsx";
import axiosConfig from "../../axiosConfig.jsx";
//import subrating
import SubratingData from "../../../public/jsons/Subrating.json";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const tags = [
  'Charging Ports',
  'Quiet Space',
  'Water Fountain',
  'Busy', 
  'Quiet', 
  'Parking Space'
];

const toggleRatingVisibility = () => {
  setIsRatingVisible(!isRatingVisible);
};

const LocationForm = ({ location }) => {
  const { currentUser } = useAuth();
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    placeName: "",
    // buildingName: "",
    floor: 1,
    categoryName: "",
    rating: 0,
    subRating1: 0,
    subRating2: 0,
    subRating3: 0,
    tags: [],
    comment: "",
    uploadedImages: [],
    selectedLocation:null,

  });
  useEffect(() => {
    if (location) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
    }
  }, [location]);
  const [isRatingVisible, setIsRatingVisible] = useState(false);

  const [ratingType, setRatingType] = useState("total");


  const currentSubratings = SubratingData.categories.find(cat => cat.category === formData.categoryName)?.subratings || {};


  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

  };
  const handleCategoryChange = (event) => {
    setFormData({
      ...formData,
      categoryName: event.target.value
    });
    console.log(formData);//formData.categoryName
  };

  const handleRatingChange = (name, newValue) => {
    if (ratingType === 'total') {
      setFormData(prevState => ({
        ...prevState,
        [name]: newValue,
        subRating1: 0,
        subRating2: 0,
        subRating3: 0
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: newValue,
        rating: 0
      }));
    }
  };


  const handleTagsChange = (event) => {
    setFormData({
      ...formData,
      tags: event.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
    const imagesArray = [];
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imagesArray.push(event.target.result);
        if (imagesArray.length === files.length) {
          setFormData({
            ...formData,
            uploadedImages: imagesArray
          });
        }
      };
      reader.readAsDataURL(files[i]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Retrieve the JWT token from cookies
    const token = Cookies.get('token');

    if (token) {
      // Set up headers with the JWT token for authorization
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // The rest of your data preparation continues here...
      const tagsObject = formData.tags.reduce((obj, item) => {
        obj[item] = 1; // You can set any value, here I've used 1 as an example
        return obj;
      }, {});

      const placeForm = {
        locName: formData.placeName,
        category: formData.categoryName,
        floor: formData.floor,
        location: {
          longitude: longitude,
          latitude: latitude,
        },
        images: formData.uploadedImages.map(image => ({ data: image })),
        totalRating: {
          overall: formData.rating,
          rating1: formData.subRating1,
          rating2: formData.subRating2,
          rating3: formData.subRating3,
        },
        tags: tagsObject,
        isDeleted: false,
        deletedDate: null,
      };

      const finalForm = {
        'place': placeForm,
        'userId': currentUser.userId, // Replace with actual user ID retrieved from context or cookies
        'comment': formData.comment.toString(),
      };
      console.log(finalForm);

      // Make the Axios POST request with the configuration
      axios.post(`${axiosConfig.baseURL}/api/place/add`, finalForm, config)
          .then(response => {
            console.log('Place added successfully:', response.data);
            // Reset form data after successful submission
            setFormData({
              placeName: '',
              // buildingName: '',
              floor: 1,
              categoryName: '',
              rating: 0,
              subRating1: 0,
              subRating2: 0,
              subRating3: 0,
              tags: [],
              comment: '',
              uploadedImages: [],
              selectedLocation: null,
            });
            alert('Location submitted successfully! Please wait for verification from our admins!');
            navigate(`/`);
            // Here, you might want to navigate to another page or give the user feedback
          })
          .catch(error => {
            console.error('Error adding place:', error);
            // Handle the error by notifying the user, for example
          });
    } else {
      // Handle the case where there is no token available
      console.error('No token found. User must be logged in to submit.');
      // Here you may want to redirect the user to the login page or show a message
    }
  };


  return (
      <div className="rating-form">
        <FormControl sx={{ mt: 2, mb: 1 }} className='category-name' variant="outlined" required>
          <InputLabel id="category-select-label">Select Category</InputLabel>
          <Select
              labelId="category-select-label"
              id="category-select"
              value={formData.categoryName}
              onChange={handleCategoryChange}
              label="Select Category"
          >
            <MenuItem value={"Bathroom"}>Bathroom</MenuItem>
            <MenuItem value={"Building"}>Building</MenuItem>
            <MenuItem value={"Dorm"}>Dorm</MenuItem>
            <MenuItem value={"Parking Lot"}>Parking Lot</MenuItem>
            <MenuItem value={"Study Space"}>Study Space</MenuItem>

          </Select>
        </FormControl>
        <TextField
            sx={{ mt: 2, mb: 1}}
            className='place-name'
            id="outlined-basic"
            label="Enter Place Name"
            variant="outlined"
            name="placeName"
            value={formData.placeName}
            onChange={handleInputChange}
            required
        />
        {/*<TextField*/}
        {/*    sx={{ mt: 2, mb: 1}}*/}
        {/*    className='building-name'*/}
        {/*    id="outlined-basic"*/}
        {/*    label="Enter Building"*/}
        {/*    variant="outlined"*/}
        {/*    name="buildingName"*/}
        {/*    value={formData.buildingName}*/}
        {/*    onChange={handleInputChange}*/}
        {/*    required*/}
        {/*/>*/}
        <div>
          <label>Select Location on Map:</label>
          {/* <Map onLocationSelected={handleLocationSelected} /> */}
          <Map setLatitude={setLatitude} setLongitude={setLongitude} />
          {formData.selectedLocation && (
              <div>
                Latitude: {formData.selectedLocation.lat}, Longitude:{" "}
                {formData.selectedLocation.lng}
              </div>
          )}
        </div>
        <TextField
            sx={{ mt: 2, mb: 1}}
            className='floor'
            id="outlined-basic"
            label="Enter Floor"
            variant="outlined"
            name="floor"
            value={formData.floor}
            onChange={handleInputChange}
        />

        <form onSubmit={handleSubmit}>
          {/* Toggle Button for Ratings Visibility */}
          <Button onClick={() => setIsRatingVisible(!isRatingVisible)} style={{marginBottom: '1rem'}}>
            Add Rating
          </Button>



          {/* Conditional Rendering based on isRatingVisible state */}
          {isRatingVisible && (
              <>
                <ToggleButtonGroup
                    value={ratingType}
                    exclusive
                    onChange={(event, newRatingType) => {
                      // Check if newRatingType is null or undefined (i.e., if user tries to unclick)
                      if (newRatingType !== null && newRatingType !== undefined) {
                        setRatingType(newRatingType);
                      }
                    }}
                    aria-label="rating type"
                    sx={{ mb: 1 }}
                >
                  <ToggleButton value="total" aria-label="left aligned" sx={{width: {
                xs: '9rem', // 100% width on extra small screens (phones)
                sm: '15.5rem' }}}>
                    Total Rating
                  </ToggleButton>
                  <ToggleButton value="sub" aria-label="centered" sx={{width: {
                xs: '9.5rem', // 100% width on extra small screens (phones)
                sm: '15.5rem' // fixed width on small screens and up
            }}}>

                    Subrating
                  </ToggleButton>
                </ToggleButtonGroup>


                {ratingType === 'total' && (
                    <div className='overall-rating'>
                      <Typography component="legend">Overall Rating:</Typography>
                      <Rating
                          name="rating"
                          value={formData.rating}
                          onChange={(event, newValue) => handleRatingChange('rating', newValue)}
                      />
                    </div>
                )}
                {ratingType === 'sub' && (
                    <>
                      {Object.entries(currentSubratings).map(([key, label], index) => {
                        const subratingKey = `subRating${index + 1}`;
                        // Ensure that you provide a default value if formData[subratingKey] is undefined.
                        const ratingValue = formData[subratingKey] !== undefined ? formData[subratingKey] : 0;
                        return (
                            <div key={key} className={`subrating-${index + 1}`}>
                              <Typography component="legend">{label}:</Typography>
                              <Rating
                                  name={subratingKey}
                                  value={ratingValue}
                                  onChange={(event, newValue) => handleRatingChange(subratingKey, newValue)}
                              />
                            </div>
                        );
                      })}
                    </>
                )}
                <div>
                  <div className='rating-tags'>
                    <FormControl sx={{ m: 1, width: 'auto', minWidth: 200, maxWidth: 450}}>
                      <InputLabel id="tags-label">Tags</InputLabel>
                      <Select
                          labelId="tags-label"
                          id="tags-select"
                          multiple
                          value={formData.tags}
                          onChange={handleTagsChange}
                          input={<OutlinedInput label="Tag" />}
                          renderValue={(selected) => selected.join(', ')}
                          MenuProps={MenuProps}
                      >
                        {tags.map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox checked={formData.tags.indexOf(name) > -1} />
                              <ListItemText primary={name} />
                            </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </div>
                </div>
                <div className='comment-rating'>
                  <TextField
                      id="filled-textarea"
                      label="Comment"
                      placeholder="Type comment here"
                      multiline
                      variant="filled"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                  />
                </div>
              </>
          )}


          <div className="upload-images">
            <label htmlFor="upload" className="upload-label">
              <span>Upload Image</span>
              <input id="upload" type="file" multiple onChange={handleImageChange} className="upload-input" />
            </label>
            {formData.uploadedImages.map((image, index) => (
                <img className='uploaded-image'key={index} src={image} alt={`Uploaded Image ${index + 1}`} />
            ))}
          </div>
          <button className='submit-button' type="submit">Submit</button>
        </form>
      </div>
  );
};

export default LocationForm;