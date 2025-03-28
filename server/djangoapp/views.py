from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, render, redirect
from django.contrib.auth import logout
from django.contrib import messages
from datetime import datetime
from django.http import JsonResponse
from django.contrib.auth import login, authenticate
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import CarMake, CarModel
from .populate import initiate
from .restapis import get_request, analyze_review_sentiments, post_review


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    # Get username and password from request.POST dictionary
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)

# Create a `logout_request` view to handle sign out request
def logout_request(request):
    # Log out the user
    logout(request)
    # Return a success response
    return JsonResponse({"success": True})

# Create a `registration` view to handle sign up request
# @csrf_exempt
# def registration(request):
# ...


@require_http_methods(["GET"])
def get_cars(request):
    count = CarMake.objects.filter().count()
    print(count)
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append({"CarModel": car_model.name, "CarMake": car_model.car_make.name})
    return JsonResponse({"CarModels": cars})


# Update the `get_dealerships` render list of dealerships all by default, particular state if state is passed
def get_dealerships(request, state="All"):
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state
    dealerships = get_request(endpoint)
    if dealerships is None:
        return JsonResponse({"status": 500, "error": "Failed to fetch dealers"})
    return JsonResponse({"status": 200, "dealers": dealerships})



def get_dealer_details(request, dealer_id):
    if dealer_id:
        try:
            # First try the direct endpoint (which might fail for numeric IDs)
            endpoint = "/fetchDealer/" + str(dealer_id)
            dealership = get_request(endpoint)
            
            # Check if the response contains an error message
            if dealership and isinstance(dealership, dict) and 'error' in dealership:
                # If there's an error, try to find the dealer by fetching all dealers and filtering
                try:
                    # Get all dealers
                    all_dealers_endpoint = "/fetchDealers"
                    all_dealers_response = get_request(all_dealers_endpoint)
                    
                    if all_dealers_response and 'dealers' in all_dealers_response:
                        # Find the dealer with the matching ID
                        dealer_id_int = int(dealer_id)  # Convert to integer for comparison
                        for dealer in all_dealers_response['dealers']:
                            if dealer.get('id') == dealer_id_int:
                                # Found the dealer, return it
                                return JsonResponse({"status": 200, "dealer": dealer})
                except Exception as fetch_all_error:
                    logger.error(f"Error fetching all dealers: {str(fetch_all_error)}")
                
                # If we still couldn't find the dealer, return a fallback
                return JsonResponse({
                    "status": 404,
                    "dealer": {
                        "message": "Dealer not found",
                        "id": dealer_id,
                        "full_name": f"Dealer #{dealer_id}",
                        "city": "",
                        "address": ""
                    }
                })
            
            # If we got a valid response from the direct endpoint, return it
            return JsonResponse({"status": 200, "dealer": dealership})
        except Exception as e:
            # If there's an exception, return a fallback dealer object
            logger.error(f"Error fetching dealer details: {str(e)}")
            return JsonResponse({
                "status": 500,
                "dealer": {
                    "message": "Error fetching dealer",
                    "id": dealer_id,
                    "full_name": f"Dealer #{dealer_id}",
                    "city": "",
                    "address": ""
                }
            })
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})



def get_dealer_reviews(request, dealer_id):
    # if dealer id has been provided
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        # Check if reviews is None or empty
        if reviews is None:
            reviews = []
        elif isinstance(reviews, list) and len(reviews) > 0:
            for review_detail in reviews:
                try:
                    response = analyze_review_sentiments(review_detail['review'])
                    # Check if response is None or doesn't have sentiment key
                    if response and 'sentiment' in response:
                        review_detail['sentiment'] = response['sentiment']
                    else:
                        # Default to neutral if sentiment analysis fails
                        review_detail['sentiment'] = 'neutral'
                except Exception as e:
                    print(f"Error analyzing sentiment: {str(e)}")
                    # Default to neutral if sentiment analysis fails
                    review_detail['sentiment'] = 'neutral'
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})



def add_review(request):
    if not request.user.is_anonymous:
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception:
            return JsonResponse({"status": 401, "message": "Error in posting review"})
    else:
        return JsonResponse({"status": 403, "message": "Unauthorized"})