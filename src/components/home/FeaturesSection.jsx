import React from 'react';

const FeaturesSection = () => {
  return (
    <section className="types" id="features">
      <h2>Features at a Glance !</h2>
      <div>
        <div className="typeInfo">
          <h4>Basic Features</h4>
          <ul>
            <li>Counter based Logins to Test/Event.</li>
            <li>
              all <b>Anti-Cheating Features</b> enabled.
            </li>
            <li>
              Option for <b>Constrained Examination</b>. (ie. Movement
              Section-by-Section. re-Attempt of Section can be disabled.)
            </li>
            <li>Offers both fixed Duration and fixed Time Frame Exams.</li>
            <li>
              <b>Proctor LIVE streaming</b>. Monitor the activity of the
              Candidate on the Go.
            </li>
            <li>Built in application to prepare and generate results.</li>
            <li>
              Passcode proctected Test and supports Invite only Participation.
            </li>
          </ul>
        </div>
        <div className="typeInfo">
          <h4>Advanced Features</h4>
          <ul>
            <li>
              Optimised support for <b>Question Bank Pool</b>. Random selection
              of questions from Question Bank.
            </li>
            <li>
              Option for <b>Media Proctoring</b> (webCam/Microphone) and{' '}
              <b>Screen Proctoring</b>.
            </li>
            <li>Ability to detect Script Tampering.</li>
            <li>
              Highly Trained AI based model to <b>detect any Test Tampering</b>{' '}
              &amp; <b>proctor stream tampering</b>.
            </li>
            <li>
              Auto-management of Candidate Stream so that you don't miss a
              second.
            </li>
            <li>
              Special Feature that tries to{' '}
              <b>Handle inabilities of System/PC</b> to a greater extent during
              final submit of responses.
            </li>
          </ul>
        </div>
      </div>
      <div>
        <div className="typeInfo">
          <h4>Candidate Restictions</h4>
          <ul>
            <li>
              Strict Exam environment, with logging of Violations and Tampers.
            </li>
            <li>
              Movement and Actions are <b>strictly monitored</b>.
            </li>
            <li>Browser TABs are monitored.</li>
            <li>
              Super fast stream tampering detection, both media and screen.
            </li>
            <li>Disabled context menu and inspecting behaviour.</li>
          </ul>
        </div>
        <div className="typeInfo">
          <h4>MCQs</h4>
          <ul>
            <li>Completely supports HTML Based question Framing.</li>
            <li>
              Option for <b>Image-Based Questions</b>.
            </li>
            <li>
              Option for an explanatory Text with a maintained character
              indentation.
            </li>
            <li>Easy navigation between Questions.</li>
            <li>Enlarged option selector.</li>
            <li>
              <b>Option Shuffling</b> &amp; <b>Question Shuffling</b>.
            </li>
          </ul>
        </div>
      </div>
      <div>
        <div className="typeInfo">
          <h4>Coding</h4>
          <ul>
            <li>
              Supports all Major Languages.
              <br />
              C, C++, C++11, C++14, C#, Go, Haskell, Java, Java 8,
              JavaScript(Rhino), JavaScript(Nodejs), Kotlin, Objective, Pascal,
              Perl, PHP, Python 2, Python 3, Scala, Swift, etc etc
            </li>
            <li>Different questions can be in different language.</li>
            <li>Can add unlimited example input and output.</li>
            <li>
              Option for Fixed <b>Upper Readable</b> and <b>Lower Readable</b>{' '}
              Codes.
            </li>
            <li>
              Can hold any Number of TestCases (each can carry varying Marks).
            </li>
            <li>
              <b>Distributed Evalution</b> (ie. Output for each Test Case is
              evaluated line by line)
            </li>
          </ul>
        </div>
        <div className="typeInfo">
          <h4>WebProgramming</h4>
          <ul>
            <li>
              HTML + CSS + JS.
              <br />
              (Can be compiled both <u>in Combination</u> and / or{' '}
              <u>Independently</u>)
            </li>
            <li>
              Supports all Top libraries and frameworks like Bootstrap, React,
              Angular, Vue, jQuery etc. etc.
            </li>
            <li>
              <b>In built Console </b>which supports all types of scripting.
            </li>
            <li>Expected Output can embed both Image and External Page.</li>
            <li>
              Draggable and Resizable Expected Output Window (Double Click to
              enable/disable dragging).
            </li>
            <li>
              <b>Full Window Editor.</b>
            </li>
            <li>
              <b>Resizable</b> Code Editors, Output Window and Console.
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
