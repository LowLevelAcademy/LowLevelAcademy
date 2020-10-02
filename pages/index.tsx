import React from "react";

import Fundraising from "../components/Fundraising";
import LessonTile from "../components/LessonTile";
import ModuleHeaderAnimation from "../components/ModuleHeaderAnimation";

export default function ModulePage() {
  return (
    <>
      <div id="module_header" className="row no-gutters">
        <div className="col-10 offset-1">
          <h2>Network Programming</h2>
          <h1>
            TCP/IP Fundamentals
            <span className="module_badge beginner_badge">Beginner</span>
            <span className="module_badge beginner_badge">Rust</span>
          </h1>
        </div>
        <div className="col-12 module-animation">
          <ModuleHeaderAnimation />
        </div>
        <div className="col-10 offset-1 module-description">
          <p>
            In this course, you will learn how to work with the UDP and TCP
            internet protocols in real-world scenarios. You will apply your
            skills to build small, fun networking applications in Rust—right in
            your browser!
          </p>
          <p>
            No previous knowledge of network programming is required, but we
            assume that you are familiar with Rust syntax. If you’re not, that's
            fine too! You can read{" "}
            <a href="https://doc.rust-lang.org/book/">The Rust Book</a> and
            learn by practicing without any setup beforehand.
          </p>
        </div>
      </div>
      <div className="container-fluid no-padding">
        <div className="row no-gutters">
          <div className="col-10 offset-1">
            <div id="module_contents" className="row no-gutters">
              <LessonTile
                href="/tcp-ip-fundamentals/exchanging-messages"
                title="Exchanging Messages"
                icon="messages_grey.svg"
              >
                Introduction to UDP: sockets, frames, and data encoding. We
                build a client for a simple name server that converts domain
                names into IP addresses.
              </LessonTile>
              <LessonTile title="Fragmentation" icon="fragmentation_grey.svg">
                Learn how to transmit large files by splitting them into small
                bits.
              </LessonTile>
              <LessonTile title="Reliability" icon="reliability_grey.svg">
                Learn how to deal with unreliable networks.
              </LessonTile>
              <LessonTile title="Routing" icon="routing_grey.svg">
                Learn how to work with larger networks. As you might have
                guessed, we also build our own router.
              </LessonTile>
              <LessonTile title="Server programming" icon="server_grey.svg">
                Learn techniques to deal with multiple clients simultaneously.
                Remember the name service from the first lesson? Now we rebuild
                it again from scratch!
              </LessonTile>
              <LessonTile title="Introducing TCP" icon="tcp_grey.svg">
                Learn about TCP connections and streams.
              </LessonTile>
              <LessonTile title="Web servers &amp; HTTP" icon="http_grey.svg">
                Putting everything we have learned so far into practice:
                let&apos;s create a web server!
              </LessonTile>
            </div>
          </div>
        </div>
      </div>
      <Fundraising />
    </>
  );
}
