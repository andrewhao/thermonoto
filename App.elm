import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Json.Decode exposing (..)
import Debug exposing (..)

-- MODEL
type alias Model =
  { startTime : String
  , endTime : String
  }

init : (Model, Cmd Msg)
init =
  ( Model "" ""
  , getOperatingHoursDetails
  )

-- UPDATE
type Msg
  = RefreshOperatingHours
  | ReceiveOperatingHoursDetails (Result Http.Error JsonResponse)

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    RefreshOperatingHours ->
      (model, getOperatingHoursDetails)

    ReceiveOperatingHoursDetails (Ok jsonResponse) ->
      Debug.log (jsonResponse |> toString)
      ( Model
         (Maybe.withDefault "" jsonResponse.start_time)
         (Maybe.withDefault "" jsonResponse.end_time)
      , Cmd.none)

    ReceiveOperatingHoursDetails (Err err) ->
      Debug.log (toString err)
      (model, Cmd.none)

-- VIEW
view : Model -> Html Msg
view model =
  div []
    [ h2 [] [text "Operating Hours"]
    , button [ onClick RefreshOperatingHours ] [ text "Refresh" ]
    , br [] []
    , p [] [text (model.startTime |> toString)]
    , p [] [text (model.endTime |> toString)]
    ]

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

-- HTTP

getOperatingHoursDetails : Cmd Msg
getOperatingHoursDetails =
  let
    url =
      "//localhost:5000/operating_hours"
  in
    Http.send ReceiveOperatingHoursDetails (Http.get url fetchOperatingHoursDetails)

type alias JsonResponse =
  { start_time : Maybe String
  , end_time : Maybe String
  }

fetchOperatingHoursDetails : Decoder JsonResponse
fetchOperatingHoursDetails =
  map2 JsonResponse
    (field "start_time" (maybe string))
    (field "end_time" (maybe string))

main =
  Html.program
    { init = init
    , view = view
    , update = update
    , subscriptions = subscriptions
    }

