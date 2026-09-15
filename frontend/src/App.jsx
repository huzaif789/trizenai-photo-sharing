import React, { useEffect, useState } from "react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// =====================================================
// PHOTO URL
// Supports:
// 1. Old local images: /uploads/image.jpg
// 2. New Cloudinary images: https://res.cloudinary.com/...
// =====================================================

function photoUrl(photo) {
  if (!photo?.storageLocation) {
    return "";
  }

  if (
    photo.storageLocation.startsWith("http://") ||
    photo.storageLocation.startsWith("https://")
  ) {
    return photo.storageLocation;
  }

  return `${API}${photo.storageLocation}`;
}

// =====================================================
// API REQUEST HELPER
// =====================================================

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : {
          "Content-Type": "application/json",
        }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Request failed"
    );
  }

  return data;
}

// =====================================================
// APP
// =====================================================

export default function App() {
  // ---------------------------------------------------
  // USER
  // ---------------------------------------------------

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user");

    try {
      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      return null;
    }
  });

  // ---------------------------------------------------
  // AUTH / CUSTOMER
  // ---------------------------------------------------

  const [register, setRegister] =
    useState(false);

  const [customer, setCustomer] =
    useState(false);

  const [message, setMessage] =
    useState("");

  // ---------------------------------------------------
  // DATA
  // ---------------------------------------------------

  const [events, setEvents] =
    useState([]);

  const [team, setTeam] =
    useState([]);

  const [current, setCurrent] =
    useState(null);

  const [photos, setPhotos] =
    useState([]);

  const [gallery, setGallery] =
    useState(null);

  const [publicPhotos, setPublicPhotos] =
    useState([]);

  const admin =
    user?.role === "admin";

  // =====================================================
  // LOAD EVENTS + TEAM
  // =====================================================

  async function load() {
    if (!user) {
      return;
    }

    try {
      const eventData =
        await request("/api/events");

      setEvents(eventData);

      if (user.role === "admin") {
        const teamData =
          await request(
            "/api/users/team"
          );

        setTeam(teamData);
      }
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    load();
  }, [user]);

  // =====================================================
  // LOGIN / REGISTER
  // =====================================================

  async function auth(e) {
    e.preventDefault();

    const form = e.currentTarget;

    const data =
      Object.fromEntries(
        new FormData(form)
      );

    setMessage("");

    try {
      // -----------------------------------------------
      // REGISTER ADMIN
      // -----------------------------------------------

      if (register) {
        await request(
          "/api/auth/register",
          {
            method: "POST",

            body: JSON.stringify(
              data
            ),
          }
        );

        form.reset();

        setRegister(false);

        setMessage(
          "Admin created successfully. Please login."
        );

        return;
      }

      // -----------------------------------------------
      // LOGIN
      // -----------------------------------------------

      const response =
        await request(
          "/api/auth/login",
          {
            method: "POST",

            body: JSON.stringify(
              data
            ),
          }
        );

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          response.user
        )
      );

      setUser(response.user);

      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // CREATE EVENT
  // =====================================================

  async function createEvent(e) {
    e.preventDefault();

    const form = e.currentTarget;

    const data =
      Object.fromEntries(
        new FormData(form)
      );

    setMessage("");

    try {
      await request(
        "/api/events",
        {
          method: "POST",

          body: JSON.stringify(
            data
          ),
        }
      );

      form.reset();

      setMessage(
        "Event created successfully."
      );

      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // CREATE TEAM MEMBER
  // =====================================================

  async function createTeam(e) {
    e.preventDefault();

    const form = e.currentTarget;

    const data =
      Object.fromEntries(
        new FormData(form)
      );

    setMessage("");

    try {
      await request(
        "/api/users/team",
        {
          method: "POST",

          body: JSON.stringify(
            data
          ),
        }
      );

      form.reset();

      setMessage(
        "Team member created successfully."
      );

      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // OPEN EVENT
  // =====================================================

  async function openEvent(event) {
    try {
      setMessage("");

      setCurrent(event);

      setGallery(null);

      const photoData =
        await request(
          `/api/photos/event/${event._id}`
        );

      setPhotos(photoData);
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // ASSIGN TEAM MEMBER
  // =====================================================

  async function assign(userId) {
    if (!userId || !current) {
      return;
    }

    try {
      await request(
        `/api/events/${current._id}/team`,
        {
          method: "POST",

          body: JSON.stringify({
            userId,
          }),
        }
      );

      setMessage(
        "Team member assigned successfully."
      );

      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // UPLOAD PHOTOS
  // =====================================================

  async function upload(e) {
    e.preventDefault();

    const form = e.currentTarget;

    if (!current) {
      setMessage(
        "Please select an event first."
      );

      return;
    }

    const fileInput =
      form.elements.photos;

    const files =
      fileInput?.files;

    if (
      !files ||
      files.length === 0
    ) {
      setMessage(
        "Please select at least one photo."
      );

      return;
    }

    const body =
      new FormData();

    for (const file of files) {
      body.append(
        "photos",
        file
      );
    }

    setMessage(
      "Uploading photos..."
    );

    try {
      const response =
        await request(
          `/api/photos/event/${current._id}`,
          {
            method: "POST",
            body,
          }
        );

      form.reset();

      setMessage(
        response.message ||
          "Photos uploaded successfully."
      );

      const photoData =
        await request(
          `/api/photos/event/${current._id}`
        );

      setPhotos(photoData);
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // SELECT / UNSELECT PHOTO
  // =====================================================

  async function select(photoId) {
    if (!current) {
      return;
    }

    try {
      setMessage("");

      await request(
        `/api/photos/${photoId}/select`,
        {
          method: "PATCH",
        }
      );

      const photoData =
        await request(
          `/api/photos/event/${current._id}`
        );

      setPhotos(photoData);
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // PUBLISH GALLERY
  // =====================================================

  async function publish() {
    if (!current) {
      return;
    }

    try {
      setMessage("");

      const response =
        await request(
          `/api/galleries/event/${current._id}/publish`,
          {
            method: "POST",
          }
        );

      setGallery(
        response.gallery
      );

      setMessage(
        "Gallery published successfully."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // CUSTOMER UNLOCK
  // =====================================================

  async function unlock(e) {
    e.preventDefault();

    const form = e.currentTarget;

    const data =
      Object.fromEntries(
        new FormData(form)
      );

    setMessage("");

    setPublicPhotos([]);

    try {
      const response =
        await request(
          `/api/galleries/public/${data.slug}/unlock`,
          {
            method: "POST",

            body: JSON.stringify({
              pin: data.pin,
            }),
          }
        );

      setPublicPhotos(
        response.photos
      );

      setMessage(
        "Gallery unlocked successfully."
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function logout() {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    setUser(null);

    setEvents([]);

    setTeam([]);

    setCurrent(null);

    setPhotos([]);

    setGallery(null);

    setPublicPhotos([]);

    setMessage("");
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!user) {
    return (
      <main className="auth">
        <section className="card">

          <h1>
            TrizenAI Photo Sharing
          </h1>

          {/* -----------------------------------------
              AUTH TABS
          ----------------------------------------- */}

          <div className="tabs">

            <button
              type="button"
              onClick={() => {
                setCustomer(false);

                setRegister(false);

                setMessage("");

                setPublicPhotos([]);
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomer(false);

                setRegister(true);

                setMessage("");

                setPublicPhotos([]);
              }}
            >
              Register Admin
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomer(true);

                setRegister(false);

                setMessage("");

                setPublicPhotos([]);
              }}
            >
              Customer Gallery
            </button>

          </div>

          {/* -----------------------------------------
              CUSTOMER GALLERY
          ----------------------------------------- */}

          {customer ? (
            <form
              onSubmit={unlock}
            >

              <input
                name="slug"
                placeholder="Gallery code"
                required
              />

              <input
                name="pin"
                placeholder="PIN"
                inputMode="numeric"
                required
              />

              <button
                type="submit"
              >
                Open Gallery
              </button>

            </form>
          ) : (

            /* ---------------------------------------
               LOGIN / REGISTER
            --------------------------------------- */

            <form
              onSubmit={auth}
            >

              {register && (
                <input
                  name="username"
                  placeholder="Username"
                  required
                />
              )}

              <input
                name="email"
                type="email"
                placeholder="Email"
                required
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                minLength="6"
                required
              />

              <button
                type="submit"
              >
                {register
                  ? "Create Admin"
                  : "Login"}
              </button>

            </form>
          )}

          {/* -----------------------------------------
              MESSAGE
          ----------------------------------------- */}

          {message && (
            <p className="msg">
              {message}
            </p>
          )}

          {/* -----------------------------------------
              PUBLIC CUSTOMER PHOTOS
          ----------------------------------------- */}

          {publicPhotos.length >
            0 && (

            <div className="grid">

              {publicPhotos.map(
                (photo) => (

                  <div
                    className="photo"
                    key={photo._id}
                  >

                    <img
                      src={photoUrl(
                        photo
                      )}
                      alt="Gallery"
                    />

                  </div>

                )
              )}

            </div>

          )}

        </section>
      </main>
    );
  }

  // =====================================================
  // LOGGED-IN APPLICATION
  // =====================================================

  return (
    <main>

      {/* =================================================
          HEADER
      ================================================= */}

      <header>

        <h2>
          TrizenAI Photo Sharing
        </h2>

        <span>
          {user.username} (
          {user.role})
        </span>

        <button
          type="button"
          onClick={logout}
        >
          Logout
        </button>

      </header>

      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <p className="msg">
          {message}
        </p>
      )}

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="layout">

        {/* ===============================================
            EVENT SIDEBAR
        =============================================== */}

        <aside>

          <h3>Events</h3>

          {events.length === 0 && (
            <p>
              No events available.
            </p>
          )}

          {events.map(
            (event) => (

              <button
                type="button"
                className="event"
                key={event._id}
                onClick={() =>
                  openEvent(event)
                }
              >
                {event.name}
              </button>

            )
          )}

        </aside>

        {/* ===============================================
            CONTENT
        =============================================== */}

        <section className="content">

          {/* =============================================
              ADMIN HOME
          ============================================= */}

          {admin &&
            !current && (

            <div className="columns">

              {/* -----------------------------------------
                  CREATE EVENT
              ----------------------------------------- */}

              <div className="card">

                <h3>
                  Create Event
                </h3>

                <form
                  onSubmit={
                    createEvent
                  }
                >

                  <input
                    name="name"
                    placeholder="Event name"
                    required
                  />

                  <textarea
                    name="description"
                    placeholder="Description"
                  />

                  <input
                    name="eventDate"
                    type="date"
                    required
                  />

                  <button
                    type="submit"
                  >
                    Create Event
                  </button>

                </form>

              </div>

              {/* -----------------------------------------
                  CREATE TEAM
              ----------------------------------------- */}

              <div className="card">

                <h3>
                  Create Team Member
                </h3>

                <form
                  onSubmit={
                    createTeam
                  }
                >

                  <input
                    name="username"
                    placeholder="Username"
                    required
                  />

                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                  />

                  <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    minLength="6"
                    required
                  />

                  <button
                    type="submit"
                  >
                    Create Team
                  </button>

                </form>

              </div>

            </div>

          )}

          {/* =============================================
              TEAM HOME
          ============================================= */}

          {!current &&
            !admin && (

            <div className="card">

              <h3>
                Select an assigned event
              </h3>

              <p>
                Choose an event from
                the Events section.
              </p>

            </div>

          )}

          {/* =============================================
              CURRENT EVENT
          ============================================= */}

          {current && (
            <>

              {/* -----------------------------------------
                  EVENT DETAILS
              ----------------------------------------- */}

              <div className="card">

                <button
                  type="button"
                  onClick={() => {
                    setCurrent(null);

                    setPhotos([]);

                    setGallery(null);

                    setMessage("");
                  }}
                >
                  Back
                </button>

                <h2>
                  {current.name}
                </h2>

                <p>
                  {current.description ||
                    "No description"}
                </p>

                {current.eventDate && (

                  <p>
                    <strong>
                      Date:
                    </strong>{" "}

                    {new Date(
                      current.eventDate
                    ).toLocaleDateString()}
                  </p>

                )}

                {/* ---------------------------------------
                    ADMIN TEAM ASSIGNMENT
                --------------------------------------- */}

                {admin && (
                  <>

                    <h3>
                      Assign Team Member
                    </h3>

                    {team.length >
                    0 ? (

                      <select
                        defaultValue=""
                        onChange={(e) => {
                          assign(
                            e.target
                              .value
                          );

                          e.target.value =
                            "";
                        }}
                      >

                        <option
                          value=""
                          disabled
                        >
                          Select team member
                        </option>

                        {team.map(
                          (member) => (

                            <option
                              key={
                                member._id
                              }
                              value={
                                member._id
                              }
                            >
                              {
                                member.username
                              }{" "}
                              -{" "}
                              {
                                member.email
                              }
                            </option>

                          )
                        )}

                      </select>

                    ) : (

                      <p>
                        Create a team
                        member first.
                      </p>

                    )}

                  </>
                )}

              </div>

              {/* -----------------------------------------
                  PHOTO UPLOAD
              ----------------------------------------- */}

              <div className="card">

                <h3>
                  Upload Photos
                </h3>

                <p>
                  You can select
                  multiple image files.
                </p>

                <form
                  onSubmit={upload}
                >

                  <input
                    name="photos"
                    type="file"
                    accept="image/*"
                    multiple
                    required
                  />

                  <button
                    type="submit"
                  >
                    Upload Photos
                  </button>

                </form>

              </div>

              {/* -----------------------------------------
                  EVENT PHOTOS
              ----------------------------------------- */}

              <div className="card">

                <h3>
                  {admin
                    ? "All Event Photos"
                    : "My Uploaded Photos"}
                </h3>

                {photos.length ===
                0 ? (

                  <p>
                    No photos uploaded
                    yet.
                  </p>

                ) : (

                  <div className="grid">

                    {photos.map(
                      (photo) => (

                        <div
                          className={
                            photo.selected
                              ? "photo selected"
                              : "photo"
                          }
                          key={
                            photo._id
                          }
                        >

                          {/* IMPORTANT:
                              Works with local AND Cloudinary
                          */}

                          <img
                            src={photoUrl(
                              photo
                            )}
                            alt="Event"
                          />

                          {photo
                            .uploadedBy
                            ?.username && (

                            <small>
                              Uploaded by:{" "}
                              {
                                photo
                                  .uploadedBy
                                  .username
                              }
                            </small>

                          )}

                          {admin && (

                            <button
                              type="button"
                              onClick={() =>
                                select(
                                  photo._id
                                )
                              }
                            >
                              {photo.selected
                                ? "Selected"
                                : "Select"}
                            </button>

                          )}

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>

              {/* -----------------------------------------
                  PUBLISH GALLERY
              ----------------------------------------- */}

              {admin && (

                <div className="card">

                  <h3>
                    Publish Customer
                    Gallery
                  </h3>

                  <p>
                    Select at least one
                    photo before
                    publishing.
                  </p>

                  <button
                    type="button"
                    onClick={publish}
                  >
                    Publish Gallery
                  </button>

                  {gallery && (

                    <div className="success">

                      <h3>
                        Gallery Published
                      </h3>

                      <p>
                        <strong>
                          Gallery Code:
                        </strong>{" "}
                        {gallery.slug}
                      </p>

                      <p>
                        <strong>
                          PIN:
                        </strong>{" "}
                        {gallery.pin}
                      </p>

                      <p>
                        Save this code
                        and PIN for
                        customer access.
                      </p>

                    </div>

                  )}

                </div>

              )}

            </>
          )}

        </section>

      </div>

    </main>
  );
}